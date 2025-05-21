import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { CacheModule } from '../../core/cache/cache.module';
import { MessagingModule } from '../../core/messaging/messaging.module';
import { QueueModule } from '../../core/queue/queue.module';

@Module({
  imports: [CacheModule, MessagingModule, QueueModule],
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class ExampleModule {} 