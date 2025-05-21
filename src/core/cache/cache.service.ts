import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';

@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private redisClient: redis.RedisClient;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    await this.initRedisClient();
  }

  private async initRedisClient() {
    try {
      const host = this.configService.get<string>('REDIS_HOST');
      const port = this.configService.get<number>('REDIS_PORT');
      const password = this.configService.get<string>('REDIS_PASSWORD');
      
      this.logger.log(`Initializing direct Redis client to ${host}:${port}`);
      
      this.redisClient = redis.createClient({
        host,
        port,
        password,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            this.logger.error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 30) {
            this.logger.error('Retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.redisClient.on('error', (err) => {
        this.logger.error(`Redis Client Error: ${err.message}`, err.stack);
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Successfully connected to Redis');
      });
    } catch (error) {
      this.logger.error(`Failed to initialize Redis client: ${error.message}`, error.stack);
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const cachedValue = await this.cacheManager.get<T>(key);
      if (cachedValue) {
        this.logger.debug(`Cache hit for key: ${key}`);
      } else {
        this.logger.debug(`Cache miss for key: ${key}`);
      }
      return cachedValue === null ? undefined : cachedValue;
    } catch (error) {
      this.logger.error(`Error getting key ${key} from cache: ${error.message}`);
      return undefined;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Set key in cache: ${key} with TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Error setting key ${key} in cache: ${error.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Deleted key from cache: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting key ${key} from cache: ${error.message}`);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.del('');
      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error(`Error clearing cache: ${error.message}`);
    }
  }
  
  // Método para obtener todas las claves en Redis
  async getAllKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.redisClient) {
        this.logger.error('Redis client not initialized');
        return resolve([]);
      }
      
      this.redisClient.keys('*', (err, keys) => {
        if (err) {
          this.logger.error(`Error getting keys from Redis: ${err.message}`);
          return reject(err);
        }
        this.logger.log(`Found ${keys.length} keys in Redis`);
        resolve(keys);
      });
    });
  }

  // Método para obtener el valor de una clave directamente de Redis
  async getFromRedis(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.redisClient) {
        this.logger.error('Redis client not initialized');
        return resolve('');
      }
      
      this.redisClient.get(key, (err, value) => {
        if (err) {
          this.logger.error(`Error getting key ${key} from Redis: ${err.message}`);
          return reject(err);
        }
        resolve(value);
      });
    });
  }
} 