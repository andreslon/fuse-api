import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PulsarClient } from '../queue/mocks/pulsar.client';

@Injectable()
export class PulsarService implements OnModuleInit, OnModuleDestroy {
  private client: PulsarClient;
  private producers = new Map();
  private consumers = new Map();
  private readonly logger = new Logger(PulsarService.name);

  constructor(private configService: ConfigService) {
    const pulsarUrl = this.configService.get<string>('PULSAR_URL', 'pulsar://localhost:6650');
    this.client = new PulsarClient(pulsarUrl);
  }

  async onModuleInit() {
    this.logger.log('Initializing Pulsar service with mock client');
  }

  async onModuleDestroy() {
    await this.closeAll();
  }

  async createProducer(topic: string, producerName: string) {
    if (this.producers.has(producerName)) {
      return this.producers.get(producerName);
    }

    const producer = await this.client.createProducer({
      topic,
      producerName,
      sendTimeoutMs: 30000,
      batchingEnabled: true
    });

    this.producers.set(producerName, producer);
    return producer;
  }

  async createConsumer(topic: string, subscription: string, consumerName: string) {
    const key = `${topic}:${subscription}:${consumerName}`;
    if (this.consumers.has(key)) {
      return this.consumers.get(key);
    }

    const consumer = await this.client.createConsumer({
      topic,
      subscription,
      subscriptionType: 'Shared',
      consumerName,
      ackTimeoutMs: 10000
    });

    this.consumers.set(key, consumer);
    return consumer;
  }

  async send(topic: string, producerName: string, message: any) {
    const producer = await this.createProducer(topic, producerName);
    return producer.send({
      data: Buffer.from(JSON.stringify(message))
    });
  }

  async subscribe(topic: string, subscription: string, consumerName: string, callback: Function) {
    const consumer = await this.createConsumer(topic, subscription, consumerName);
    await consumer.subscribe(topic);
    
    this.logger.log(`Subscribed to topic ${topic} with subscription ${subscription}`);
    
    // Mock implementation - in a real scenario this would be a message listener
    setInterval(async () => {
      try {
        const message = await consumer.receive();
        await callback(message);
        await message.acknowledgeMessage();
      } catch (error) {
        this.logger.error(`Error processing message: ${error.message}`);
      }
    }, 5000); // Simulate messages every 5 seconds
  }

  async closeAll() {
    for (const [_, producer] of this.producers) {
      await producer.close();
    }
    this.producers.clear();

    for (const [_, consumer] of this.consumers) {
      await consumer.close();
    }
    this.consumers.clear();

    await this.client.close();
  }
} 