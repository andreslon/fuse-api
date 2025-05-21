import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class SendReportDto {
  @ApiProperty({ description: 'User ID for which to generate report', example: 'user1' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Email address to send the report to', example: 'andres.londono@neobit.com.co' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Whether to include transaction details', 
    example: true, 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  includeTransactions: boolean = true;

  @ApiProperty({ 
    description: 'Whether to include portfolio details', 
    example: true, 
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  includePortfolio: boolean = true;
} 