class InMemoryStateStore {
  constructor(options = {}) {
    this.store = new Map();
    this.defaultTtlMs = options.defaultTtlMs || 10 * 60 * 1000;
  }

  async set(key, value, ttlMs) {
    const expiresAt = Date.now() + (ttlMs || this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async delete(key) {
    this.store.delete(key);
  }
}

module.exports = { InMemoryStateStore };
