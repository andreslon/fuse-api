import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExampleService } from './example.service';

@ApiTags('Example')
@Controller('example')
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Get('cache/:key')
  @ApiOperation({ summary: 'Get a value from cache' })
  async getFromCache(@Param('key') key: string) {
    const value = await this.exampleService.getFromCache(key);
    return { key, value };
  }

  @Post('cache/:key')
  @ApiOperation({ summary: 'Save a value to cache' })
  async saveToCache(
    @Param('key') key: string,
    @Body() data: { value: any; ttl?: number },
  ) {
    await this.exampleService.saveToCache(key, data.value, data.ttl);
    return { success: true, message: `Value saved to cache with key: ${key}` };
  }

  @Post('email')
  @ApiOperation({ summary: 'Send a test email' })
  async sendEmail(
    @Body() data: { to: string; subject: string; body: string },
  ) {
    await this.exampleService.sendEmail(data.to, data.subject, data.body);
    return { success: true, message: `Email sent to ${data.to}` };
  }

  @Post('queue')
  @ApiOperation({ summary: 'Add a job to the queue' })
  async addToQueue(@Body() data: { jobName: string; data: any }) {
    await this.exampleService.addToQueue(data.jobName, data.data);
    return { success: true, message: `Job added to queue: ${data.jobName}` };
  }

  @Post('pulsar')
  @ApiOperation({ summary: 'Send a message to a Pulsar topic' })
  async sendToPulsar(@Body() data: { topic: string; message: any }) {
    await this.exampleService.sendToPulsarTopic(data.topic, data.message);
    return { success: true, message: `Message sent to topic: ${data.topic}` };
  }

  @Post('pulsar/subscribe')
  @ApiOperation({ summary: 'Subscribe to a Pulsar topic' })
  async subscribeToPulsar(@Body() data: { topic: string }) {
    await this.exampleService.subscribeToTopic(data.topic);
    return { success: true, message: `Subscribed to topic: ${data.topic}` };
  }
} 