const INTEGER_SETTINGS = {
  MONGO_MAX_POOL_SIZE: { option: "maxPoolSize", min: 1, max: 200 },
  MONGO_MIN_POOL_SIZE: { option: "minPoolSize", min: 0, max: 50 },
  MONGO_SERVER_SELECTION_TIMEOUT_MS: { option: "serverSelectionTimeoutMS", min: 1000, max: 120000 },
  MONGO_CONNECT_TIMEOUT_MS: { option: "connectTimeoutMS", min: 1000, max: 120000 },
  MONGO_SOCKET_TIMEOUT_MS: { option: "socketTimeoutMS", min: 0, max: 600000 },
  MONGO_MAX_IDLE_TIME_MS: { option: "maxIdleTimeMS", min: 0, max: 600000 },
};

function buildMongoOptions(env = process.env) {
  const options = {};

  for (const [name, rule] of Object.entries(INTEGER_SETTINGS)) {
    const raw = env[name];
    if (raw === undefined || raw === null || String(raw).trim() === "") continue;

    const text = String(raw).trim();
    if (!/^\d+$/.test(text)) {
      throw new Error(name + " must be an integer between " + rule.min + " and " + rule.max);
    }

    const value = Number(text);
    if (!Number.isSafeInteger(value) || value < rule.min || value > rule.max) {
      throw new Error(name + " must be an integer between " + rule.min + " and " + rule.max);
    }
    options[rule.option] = value;
  }

  if (
    options.maxPoolSize !== undefined &&
    options.minPoolSize !== undefined &&
    options.minPoolSize > options.maxPoolSize
  ) {
    throw new Error("MONGO_MIN_POOL_SIZE cannot be greater than MONGO_MAX_POOL_SIZE");
  }

  return options;
}

module.exports = { buildMongoOptions };
