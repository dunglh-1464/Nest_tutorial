import {plainToInstance} from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  ValidationError,
  validateSync,
} from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV!: NodeEnv;

  @IsNumber()
  PORT!: number;

  @IsString()
  DEFAULT_LANGUAGE!: string;
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
