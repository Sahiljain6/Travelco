const locks = new Map();

async function withKeyedLock(key, operation) {
  const lockKey = String(key);
  const previous = locks.get(lockKey) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });

  locks.set(lockKey, current);
  await previous;

  try {
    return await operation();
  } finally {
    release();
    if (locks.get(lockKey) === current) locks.delete(lockKey);
  }
}

async function withKeyedLocks(keys, operation) {
  const orderedKeys = [...new Set(keys.map(String))].sort();
  const acquire = (index) => {
    if (index >= orderedKeys.length) return operation();
    return withKeyedLock(orderedKeys[index], () => acquire(index + 1));
  };
  return acquire(0);
}

module.exports = { withKeyedLock, withKeyedLocks };
