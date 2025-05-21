import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseInterface, PaginationMeta } from './paginated-response.interface';

/**
 * DTO for pagination query parameters
 */
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

/**
 * Create a paginated response object
 * @param data The data array to paginate
 * @param total Total count of items (before pagination)
 * @param paginationDto The pagination parameters
 * @returns A structured paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  paginationDto: PaginationDto,
): PaginatedResponseInterface<T> {
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