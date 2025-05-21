import { Logger } from '@nestjs/common';

export class PulsarClient {
  private readonly logger = new Logger('PulsarClient');
  private connected = false;

  constructor(serviceUrl: string) {
    this.logger.log(`Mock Pulsar client initialized with URL: ${serviceUrl}`);
  }

  async createProducer(options: any) {
    this.logger.log(`Creating mock producer with options: ${JSON.stringify(options)}`);
    return {
      send: async (message: any) => {
        this.logger.debug(`Mock message sent: ${JSON.stringify(message)}`);
        return { messageId: `mock-${Date.now()}` };
      },
      close: async () => {
        this.logger.debug('Mock producer closed');
      }
    };
  }

  async createConsumer(options: any) {
    this.logger.log(`Creating mock consumer with options: ${JSON.stringify(options)}`);
    return {
      subscribe: async (topic: string) => {
        this.logger.debug(`Subscribed to topic: ${topic}`);
      },
      receive: async () => {
        return {
          data: Buffer.from('Mock message'),
          properties: {},
          messageId: `mock-${Date.now()}`,
          topic: options.topic || 'mock-topic',
          acknowledgeMessage: async () => {
            this.logger.debug('Message acknowledged');
          }
        };
      },
      close: async () => {
        this.logger.debug('Mock consumer closed');
      }
    };
  }

  async close() {
    this.logger.log('Mock Pulsar client closed');
    this.connected = false;
  }
} 