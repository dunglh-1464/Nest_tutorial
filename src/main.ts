import {NestFactory} from '@nestjs/core';
import {ConfigService} from '@nestjs/config';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {I18nValidationExceptionFilter, I18nValidationPipe} from 'nestjs-i18n';
import {AppModule} from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const SWAGGER_PATH = 'api/docs';

  app.setGlobalPrefix('api');

  // Validate every incoming DTO. The I18n flavour of ValidationPipe routes error
  // messages through i18n, so they follow ?lang= just like successful responses.
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true, // strip properties not declared on the DTO
      forbidNonWhitelisted: true, // ...and reject them instead of dropping silently
      transform: true, // coerce values to the types declared on the DTO
    }),
  );

  // Catch validation failures and translate their messages. detailedErrors: false
  // keeps the response lean: a flat array of strings, not the ValidationError tree.
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({detailedErrors: false}),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.get<string>('app.name') ?? 'API')
    .setDescription('API documentation for the Nest tutorial')
    .setVersion('1.0')
    .addBearerAuth() // unused in Pull 1; Pull 2 (auth) will need it
    .build();
  SwaggerModule.setup(
    SWAGGER_PATH,
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(config.get<number>('app.port') ?? 3000);
}

await bootstrap();
