import {registerAs} from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME,
  port: parseInt(process.env.PORT ?? '3000', 10),
  defaultLanguage: process.env.DEFAULT_LANGUAGE ?? 'en',
}));
