import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../../modules/users/entities/user.entity';
import { Portfolio } from '../../modules/portfolio/entities/portfolio.entity';
import { Transaction } from '../../modules/transactions/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'fuse-pgsql.postgres.database.azure.com'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'usradmin'),
        password: configService.get<string>('DATABASE_PASSWORD', '95GNPi1kF&dH1pHc'),
        database: configService.get<string>('DATABASE_NAME', 'fuse_db'),
        entities: [User, Portfolio, Transaction],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false, // For Azure, we might need this (not recommended for production)
        },
        logging: configService.get<boolean>('DATABASE_LOGGING', false),
      }),
    }),
  ],
})
export class DatabaseModule {} 