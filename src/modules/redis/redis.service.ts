import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.constant.js';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly client: RedisClientType) {}

  async setWithTtl(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.client.set(key, value, {
      expiration: { type: 'EX', value: ttlSeconds },
    });
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1; // exists() trả về số, không phải boolean
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close(); // quit() đã deprecated ở v6
  }
}
