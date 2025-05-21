import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/pagination/pagination.util';

/**
 * DTO for listing stocks with filtering and pagination
 */
export class ListStocksDto extends PaginationDto {
  @ApiProperty({ description: 'Filter by stock symbol', required: false })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiProperty({ description: 'Filter by market', required: false })
  @IsOptional()
  @IsString()
  market?: string;
} 