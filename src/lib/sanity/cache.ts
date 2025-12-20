type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

class SanityCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly TTL = 1000 * 60 * 30;
  private pendingRequests = new Map<string, Promise<any>>();

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (entry && now - entry.timestamp < this.TTL) {
      return entry.data;
    }

    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = fetcher().then((data) => {
      this.cache.set(key, { data, timestamp: now });
      this.pendingRequests.delete(key);
      return data;
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }
}

export const sanityCache = new SanityCache();
