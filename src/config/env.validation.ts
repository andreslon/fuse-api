import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';
import { plainToClass } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV?: Environment = Environment.Development;

  @IsOptional()
  @IsNumber()
  PORT?: number = 3000;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string = 'localhost';

  @IsOptional()
  @IsNumber()
  REDIS_PORT?: number = 6379;

  @IsOptional()
  @IsString()
  PULSAR_URL?: string = 'pulsar://localhost:6650';

  @IsOptional()
  @IsString()
  SENDGRID_API_KEY?: string = 'mock_sendgrid_api_key';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, {
    ...new EnvironmentVariables(),
    ...config,
  }, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.warn('Environment validation errors:', errors);
  }

  return validatedConfig;
} 