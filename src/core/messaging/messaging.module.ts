import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import { PulsarService } from './pulsar.service';

@Module({
  imports: [ConfigModule],
  providers: [MessagingService, PulsarService],
  exports: [MessagingService, PulsarService],
})
export class MessagingModule {} 