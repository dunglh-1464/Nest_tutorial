import {plainToInstance} from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidationError,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsNumber()
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  DEFAULT_LANGUAGE!: string;

  @IsOptional()
  @IsString()
  APP_NAME: string;

  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;


  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  @IsNumber()
  @IsOptional()
  DB_TEST_PORT: number;

  @IsString()
  JWT_EXPIRES_IN: string;
}

/**
 * Thrown when environment variables fail validation at startup.
 *
 * A dedicated class rather than a plain `Error` so callers can tell this cause
 * apart, and so the stack trace carries a meaningful name instead of "Error".
 */
export class EnvValidationError extends Error {
  constructor(readonly errors: ValidationError[]) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    super(`Invalid environment variables: ${details}`);
    this.name = 'EnvValidationError';
  }
}

export function validate(config: Record<string, unknown>) {
  const parsed = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(parsed, {skipMissingProperties: false});
  if (errors.length) throw new EnvValidationError(errors);
  return parsed;
}
