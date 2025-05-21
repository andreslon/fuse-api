import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ description: 'Number of items to skip', required: false, default: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;

  @ApiProperty({ description: 'Maximum number of items to return', required: false, default: 10, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit: number = 10;
}

export interface PaginationMeta {
  offset: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  paginationDto: PaginationDto,
): PaginatedResponse<T> {
  const { offset, limit } = paginationDto;
  
  return {
    data,
    meta: {
      offset,
      limit,
      total,
      hasNextPage: offset + limit < total,
    },
  };
} 