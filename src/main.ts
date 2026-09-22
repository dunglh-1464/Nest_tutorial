import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app.module.js';
import { formatValidationErrors } from './common/format-validation-errors.js';
import { join } from 'node:path';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const SWAGGER_PATH = 'api/docs';

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Validation failures follow the RealWorld error contract: status 422 and
  // messages grouped by field, e.g. { errors: { email: ["can't be blank"] } }.
  // errorFormatter groups the (already translated) errors; responseBodyFormatter
  // replaces Nest's default { statusCode, message, error } envelope entirely.
  // Do not add `detailedErrors` here: its presence disables errorFormatter.
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      errorHttpStatusCode: 422,
      errorFormatter: formatValidationErrors,
      responseBodyFormatter: (_host, _exc, formattedErrors) => ({
        errors: formattedErrors,
      }),
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
    prefix: '/uploads/',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.get<string>('app.name') ?? 'API')
    .setDescription('API documentation for the Nest tutorial')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description:
          'Paste the full header value, including the scheme: Token <jwt>',
      },
      'token',
    )
    .build();
  SwaggerModule.setup(
    SWAGGER_PATH,
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(config.get<number>('app.port') ?? 3000);
}

await bootstrap();
