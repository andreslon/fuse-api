import { IsEnum, IsNumber, IsString, validateSync, IsOptional, IsUrl, Matches, IsBoolean } from 'class-validator';
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
  PORT: number = 3000;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  VENDOR_API_BASE_URL: string = 'https://api.challenge.fusefinance.com';

  @IsOptional()
  @IsString()
  VENDOR_API_KEY: string = 'nSbPbFJfe95BFZufiDwF32UhqZLEVQ5K4wdtJI2e';

  @IsOptional()
  @IsString()
  SENDGRID_API_KEY: string = 'dummy_key_for_development';

  @IsOptional()
  @IsString()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  SENDER_EMAIL: string = 'report@fuseapi.com';

  @IsOptional()
  @IsString()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  REPORT_RECIPIENT_EMAIL: string = 'admin@example.com';

  @IsOptional()
  @IsString()
  @Matches(/^(\d+\s+){4}(\d+)(\s+.*)?$/) // Cron expression validation with optional comment
  CRON_REPORT_EXPRESSION: string = '0 20 * * *'; // Default to 8:00 PM daily

  @IsOptional()
  @IsString()
  REDIS_HOST?: string = 'localhost';

  @IsOptional()
  @IsNumber()
  REDIS_PORT?: number = 6379;

  @IsOptional()
  @IsString()
  PULSAR_URL?: string = 'pulsar://localhost:6650';
  
  // Database configuration
  @IsOptional()
  @IsString()
  DATABASE_HOST: string = 'fuse-pgsql.postgres.database.azure.com';

  @IsOptional()
  @IsNumber()
  DATABASE_PORT: number = 5432;

  @IsOptional()
  @IsString()
  DATABASE_USERNAME: string = 'usradmin';

  @IsOptional()
  @IsString()
  DATABASE_PASSWORD: string = '95GNPi1kF&dH1pHc';

  @IsOptional()
  @IsString()
  DATABASE_NAME: string = 'fuse_db';

  @IsOptional()
  @IsBoolean()
  DATABASE_SYNCHRONIZE: boolean = false;

  @IsOptional()
  @IsBoolean()
  DATABASE_LOGGING: boolean = true;
}

export function validate(config: Record<string, unknown>) {
  try {
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
      console.warn('Environment validation warnings:', 
        errors.map(err => ({
          property: err.property,
          constraints: err.constraints
        }))
      );
      
      // En desarrollo, permitimos continuar con valores predeterminados
      if (config['NODE_ENV'] === Environment.Production) {
        throw new Error(`Environment validation errors in production: ${JSON.stringify(errors)}`);
      }
    }

    return validatedConfig;
  } catch (error) {
    console.error('Error validating environment:', error);
    if (config['NODE_ENV'] === Environment.Development) {
      console.warn('Using default values in development mode');
      return new EnvironmentVariables();
    }
    throw error;
  }
} 