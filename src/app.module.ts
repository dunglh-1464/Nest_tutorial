import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  I18nModule,
  QueryResolver,
  HeaderResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import appConfig from './config/app.config.js';
import { validate } from './config/env.validation.js';
import { HelloModule } from './modules/hello/hello.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './modules/redis/redis.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig], validate }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: `${import.meta.dirname}/i18n/`,
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        new HeaderResolver(['x-lang']),
        AcceptLanguageResolver,
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    HelloModule,
    UsersModule,
    RedisModule,
  ],
})
export class AppModule {}
