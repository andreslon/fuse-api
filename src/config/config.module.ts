import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env'],
      load: [
        () => ({
          NODE_ENV: process.env.NODE_ENV || 'development',
          PORT: parseInt(process.env.PORT || '3000', 10),
          REDIS_HOST: process.env.REDIS_HOST || 'localhost',
          REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
          PULSAR_URL: process.env.PULSAR_URL || 'pulsar://localhost:6650',
          SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || 'mock_sendgrid_api_key',
        }),
      ],
    }),
  ],
})
export class ConfigModule {} 