const RETRYABLE_CODES = new Set([
  "ECONNABORTED",
  "ECONNRESET",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EPIPE",
]);

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientFailure(error) {
  const status = error && error.response && error.response.status;
  return RETRYABLE_CODES.has(error && error.code) || RETRYABLE_STATUS_CODES.has(status);
}

// Call only around idempotent/read-only operations such as third-party GET requests.
// Never use this helper for booking POSTs, uploads or other non-idempotent operations.
async function withTransientRetry(operation, {
  maxRetries = 1,
  baseDelayMs = 150,
  maxDelayMs = 1000,
  sleepFn = sleep,
  shouldRetry = isTransientFailure,
} = {}) {
  if (typeof operation !== "function") throw new Error("operation must be a function");
  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0 || maxRetries > 2) {
    throw new Error("maxRetries must be an integer from 0 to 2");
  }

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxRetries || !shouldRetry(error)) throw error;
      const delay = Math.min(maxDelayMs, baseDelayMs * (2 ** attempt));
      await sleepFn(delay);
      attempt += 1;
    }
  }
}

class CircuitOpenError extends Error {
  constructor(service) {
    super("External service circuit is open");
    this.name = "CircuitOpenError";
    this.code = "CIRCUIT_OPEN";
    this.service = service;
  }
}

function createCircuitBreaker({ service, failureThreshold = 3, cooldownMs = 30000, now = Date.now } = {}) {
  if (!Number.isSafeInteger(failureThreshold) || failureThreshold < 1) {
    throw new Error("failureThreshold must be a positive integer");
  }
  if (!Number.isSafeInteger(cooldownMs) || cooldownMs < 1) {
    throw new Error("cooldownMs must be a positive integer");
  }
  if (typeof now !== "function") throw new Error("now must be a function");

  let state = "closed";
  let failures = 0;
  let openedAt = 0;
  let probeInFlight = false;

  async function execute(operation) {
    const currentTime = now();
    if (state === "open") {
      if (currentTime - openedAt < cooldownMs) throw new CircuitOpenError(service);
      state = "half-open";
    }
    if (state === "half-open") {
      if (probeInFlight) throw new CircuitOpenError(service);
      probeInFlight = true;
    }

    const wasProbe = state === "half-open";
    try {
      const result = await operation();
      state = "closed";
      failures = 0;
      probeInFlight = false;
      return result;
    } catch (error) {
      probeInFlight = false;
      failures += 1;
      if (wasProbe || failures >= failureThreshold) {
        state = "open";
        openedAt = now();
      }
      throw error;
    }
  }

  return {
    execute,
    getState: () => state,
    getFailureCount: () => failures,
  };
}

function createConcurrencyLimiter({ maxConcurrent = 8, maxQueued = 16 } = {}) {
  if (!Number.isSafeInteger(maxConcurrent) || maxConcurrent < 1) {
    throw new Error("maxConcurrent must be a positive integer");
  }
  if (!Number.isSafeInteger(maxQueued) || maxQueued < 0) {
    throw new Error("maxQueued must be a non-negative integer");
  }

  let active = 0;
  const queue = [];

  function drain() {
    while (active < maxConcurrent && queue.length > 0) {
      const item = queue.shift();
      active += 1;
      Promise.resolve()
        .then(item.operation)
        .then(item.resolve, item.reject)
        .finally(() => {
          active -= 1;
          drain();
        });
    }
  }

  function run(operation) {
    if (typeof operation !== "function") return Promise.reject(new Error("operation must be a function"));
    if (active < maxConcurrent && queue.length === 0) {
      active += 1;
      return Promise.resolve()
        .then(operation)
        .finally(() => {
          active -= 1;
          drain();
        });
    }
    if (queue.length >= maxQueued) {
      const error = new Error("External service concurrency limit reached");
      error.code = "EXTERNAL_CONCURRENCY_LIMIT";
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      queue.push({ operation, resolve, reject });
      drain();
    });
  }

  return { run, getActiveCount: () => active, getQueuedCount: () => queue.length };
}

const flightSearchBreaker = createCircuitBreaker({ service: "flight-search", failureThreshold: 3, cooldownMs: 30000 });
const weatherGeocodingBreaker = createCircuitBreaker({ service: "weather-geocoding", failureThreshold: 3, cooldownMs: 30000 });
const weatherDataBreaker = createCircuitBreaker({ service: "weather-data", failureThreshold: 3, cooldownMs: 30000 });
const flightSearchConcurrency = createConcurrencyLimiter({ maxConcurrent: 4, maxQueued: 8 });
const weatherConcurrency = createConcurrencyLimiter({ maxConcurrent: 6, maxQueued: 12 });

module.exports = {
  withTransientRetry,
  isTransientFailure,
  CircuitOpenError,
  createCircuitBreaker,
  createConcurrencyLimiter,
  flightSearchBreaker,
  weatherGeocodingBreaker,
  weatherDataBreaker,
  flightSearchConcurrency,
  weatherConcurrency,
};
