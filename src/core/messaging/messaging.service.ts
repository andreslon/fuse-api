import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(private configService: ConfigService) {}

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    this.logger.debug(`Mock sending email to ${to} with subject: ${subject}`);
    this.logger.debug(`Email content: ${text}`);
    if (html) {
      this.logger.debug(`HTML content: ${html}`);
    }
  }

  async sendBulkEmails(emails: Array<{ to: string; subject: string; text: string; html?: string }>): Promise<void> {
    for (const email of emails) {
      await this.sendEmail(email.to, email.subject, email.text, email.html);
    }
  }
} 