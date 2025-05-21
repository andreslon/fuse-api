import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import { PulsarService } from './pulsar.service';
import { SendGridService } from './email/sendgrid.service';

@Module({
  imports: [ConfigModule],
  providers: [MessagingService, PulsarService, SendGridService],
  exports: [MessagingService, PulsarService, SendGridService],
})
export class MessagingModule {} 