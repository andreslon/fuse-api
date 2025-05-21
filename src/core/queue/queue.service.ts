import { Injectable, Logger } from '@nestjs/common';

interface QueueJob {
  id: string;
  name: string;
  data: any;
  timestamp: Date;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private jobs: QueueJob[] = [];

  constructor() {}

  async add<T>(name: string, data: T, opts?: any): Promise<void> {
    const job = {
      id: `job-${Date.now()}`,
      name,
      data,
      timestamp: new Date(),
    };
    
    this.jobs.push(job);
    this.logger.debug(`Added job ${job.id} to queue ${name}`);
  }

  async process<T>(name: string, processor: (job: any) => Promise<T>): Promise<void> {
    this.logger.debug(`Registered processor for queue ${name}`);
  }

  async getJob(id: string): Promise<QueueJob | null> {
    return this.jobs.find(job => job.id === id) || null;
  }

  async getJobs(types: string[]): Promise<QueueJob[]> {
    return this.jobs.filter(job => types.includes(job.name));
  }

  async clean(grace: number, status: string): Promise<void> {
    this.logger.debug(`Cleaned queue with grace ${grace} and status ${status}`);
    this.jobs = [];
  }
} 