import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendGridService, EmailOptions } from './email/sendgrid.service';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly sendGridService: SendGridService,
  ) {}

  /**
   * Send an email using the configured email service
   */
  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    this.logger.log(`Sending email to ${to} with subject: ${subject}`);
    
    try {
      const emailOptions: EmailOptions = {
        to,
        subject,
        text,
        html: html || text, // Use text as HTML if HTML not provided
      };
      
      return this.sendGridService.sendEmail(emailOptions);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Send multiple emails at once
   */
  async sendBulkEmails(emails: Array<{ to: string; subject: string; text: string; html?: string }>): Promise<boolean[]> {
    const results: boolean[] = [];
    
    for (const email of emails) {
      const result = await this.sendEmail(
        email.to, 
        email.subject, 
        email.text, 
        email.html
      );
      results.push(result);
    }
    
    return results;
  }
} 