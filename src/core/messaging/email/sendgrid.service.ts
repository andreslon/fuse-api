import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendgrid from '@sendgrid/mail';
import { BaseAppException } from '../../exceptions/base-app.exception';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

@Injectable()
export class SendGridService {
  private readonly logger = new Logger(SendGridService.name);
  private readonly senderEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY must be set in the environment variables');
    }
    
    sendgrid.setApiKey(apiKey);
    
    const sender = this.configService.get<string>('SENDER_EMAIL');
    if (!sender) {
      throw new Error('SENDER_EMAIL must be set in the environment variables');
    }
    
    this.senderEmail = sender;
    this.logger.log('SendGrid service initialized');
  }

  /**
   * Send an email using SendGrid
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: options.from || this.senderEmail,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      this.logger.log(`Sending email to ${options.to} with subject "${options.subject}"`);
      
      await sendgrid.send(msg);
      
      this.logger.log('Email sent successfully');
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      
      throw new BaseAppException(
        `Failed to send email: ${error.message}`,
        'EMAIL_SEND_FAILED',
      );
    }
  }
} 