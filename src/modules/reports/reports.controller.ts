import { Controller, Post, Body, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { SendReportDto } from './dto/send-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';

@ApiTags('reports')
@Controller('api/v1/reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(private readonly reportsService: ReportsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a transaction report to a specified email' })
  @ApiBody({ type: SendReportDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Report sent successfully',
    type: ReportResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @ApiResponse({ status: 500, description: 'Error generating or sending report' })
  async sendReport(@Body() sendReportDto: SendReportDto): Promise<ReportResponseDto> {
    try {
      this.logger.log(`Received request to send report to ${sendReportDto.email}`);
      
      const result = await this.reportsService.generateAndSendReportToEmail(
        sendReportDto.userId,
        sendReportDto.email,
        sendReportDto.includeTransactions,
        sendReportDto.includePortfolio
      );
      
      return {
        success: true,
        message: `Report sent successfully to ${sendReportDto.email}`,
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Error sending report: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          success: false,
          message: `Failed to send report: ${error.message}`,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  
  @Post('generate/daily')
  @ApiOperation({ summary: 'Manually trigger daily reports generation' })
  @ApiResponse({ 
    status: 200, 
    description: 'Daily reports generated successfully',
    type: ReportResponseDto 
  })
  @ApiResponse({ status: 500, description: 'Error generating daily reports' })
  async generateDailyReports(): Promise<ReportResponseDto> {
    try {
      this.logger.log('Manually triggering daily reports generation');
      
      await this.reportsService.generateDailyReports();
      
      return {
        success: true,
        message: 'Daily reports generated and sent successfully',
        timestamp: new Date().toISOString(),
        requestId: `req_${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Error generating daily reports: ${error.message}`, error.stack);
      
      throw new HttpException(
        {
          success: false,
          message: `Failed to generate daily reports: ${error.message}`,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 