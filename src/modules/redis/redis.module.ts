import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { REDIS_CLIENT } from './redis.constant.js';
import { RedisService } from './redis.service.js';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT, // cất dưới tên này
      inject: [ConfigService], // hàm bên dưới cần ConfigService
      useFactory: async (config: ConfigService) => {
        const client = createClient({
          socket: {
            host: config.get<string>('REDIS_HOST'),
            port: config.get<number>('REDIS_PORT'),
          },
        });
        // Không có listener 'error' thì Redis rớt kết nối là cả app sập
        client.on('error', (err) => new Logger('Redis').error(err));
        await client.connect();
        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService], // module khác import mới dùng được
})
export class RedisModule {}
