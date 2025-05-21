import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/pagination/pagination.util';

export class ListStocksDto extends PaginationDto {
  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsString()
  market?: string;
} 