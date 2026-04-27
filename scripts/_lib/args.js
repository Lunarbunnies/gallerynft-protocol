export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) continue;
    const key = part.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

export function requireArg(args, key, message) {
  const value = args[key];
  if (value === undefined || value === null || value === "") {
    throw new Error(message || `Missing --${key}`);
  }
  return value;
}

export function toBigInt(value, name) {
  try {
    return BigInt(value);
  } catch {
    throw new Error(`${name} must be a valid integer`);
  }
}

export function toNumber(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`${name} must be a valid number`);
  }
  return n;
}
