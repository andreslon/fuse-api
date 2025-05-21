import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './core/logger/logger.module';
import { CacheModule } from './core/cache/cache.module';
import { QueueModule } from './core/queue/queue.module';
import { MessagingModule } from './core/messaging/messaging.module';
import { ExceptionsModule } from './core/exceptions/exceptions.module';
import { HealthModule } from './modules/health/health.module';
import { ExampleModule } from './modules/example/example.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    CacheModule,
    QueueModule,
    MessagingModule,
    ExceptionsModule,
    HealthModule,
    ExampleModule,
  ],
})
export class AppModule {}
