import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {
  I18nModule,
  QueryResolver,
  HeaderResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import appConfig from './config/app.config.js';
import {validate} from './config/env.validation.js';
import {HelloModule} from './modules/hello/hello.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, load: [appConfig], validate}),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: `${import.meta.dirname}/i18n/`,
        watch: true,
      },
      resolvers: [
        {use: QueryResolver, options: ['lang']},
        new HeaderResolver(['x-lang']),
        AcceptLanguageResolver,
      ],
    }),
    HelloModule,
  ],
})
export class AppModule {}
