import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../core/cache/cache.service';
import { MessagingService } from '../../core/messaging/messaging.service';
import { QueueService } from '../../core/queue/queue.service';
import { PulsarService } from '../../core/messaging/pulsar.service';

@Injectable()
export class ExampleService {
  private readonly logger = new Logger(ExampleService.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly messagingService: MessagingService,
    private readonly queueService: QueueService,
    private readonly pulsarService: PulsarService,
  ) {}

  async getFromCache(key: string): Promise<any> {
    return this.cacheService.get(key);
  }

  async saveToCache(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheService.set(key, value, ttl);
    this.logger.log(`Saved to cache: ${key}`);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.messagingService.sendEmail(to, subject, body);
    this.logger.log(`Email sent to ${to}`);
  }

  async addToQueue(jobName: string, data: any): Promise<void> {
    await this.queueService.add(jobName, data);
    this.logger.log(`Added to queue: ${jobName}`);
  }

  async sendToPulsarTopic(topic: string, message: any): Promise<void> {
    await this.pulsarService.send(topic, 'example-producer', message);
    this.logger.log(`Sent to Pulsar topic: ${topic}`);
  }

  async subscribeToTopic(topic: string): Promise<void> {
    await this.pulsarService.subscribe(
      topic,
      'example-subscription',
      'example-consumer',
      async (message: any) => {
        this.logger.log(`Received message from topic ${topic}: ${message.data.toString()}`);
      }
    );
    this.logger.log(`Subscribed to Pulsar topic: ${topic}`);
  }
} 