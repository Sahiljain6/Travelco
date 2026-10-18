const SERVICE = "travelco-api";

function write(level, fields = {}) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE,
    ...fields,
  };
  const line = JSON.stringify(record);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

module.exports = {
  info: (fields) => write("info", fields),
  warn: (fields) => write("warn", fields),
  error: (fields) => write("error", fields),
};
