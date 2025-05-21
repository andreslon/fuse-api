import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    const result = await this.cacheManager.get<T>(key);
    return result === null ? undefined : result;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async clear(): Promise<void> {
    // Using del for each key as reset is not available
    // This is a workaround
    try {
      // The store might have a method to clear all keys
      if (typeof (this.cacheManager as any).store?.clear === 'function') {
        await (this.cacheManager as any).store.clear();
      }
    } catch (error) {
      console.error('Failed to clear cache', error);
    }
  }
} 