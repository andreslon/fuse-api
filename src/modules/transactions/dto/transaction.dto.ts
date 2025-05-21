import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum for transaction types
 */
export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * DTO for transaction data
 */
export class TransactionDto {
  @ApiProperty({ description: 'Transaction ID', example: '1234abcd' })
  id?: string;

  @ApiProperty({ description: 'User ID', example: 'user1' })
  userId: string;

  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;

  @ApiProperty({ description: 'Number of shares', example: 10 })
  quantity: number;

  @ApiProperty({ description: 'Price per share at transaction time', example: 150.75 })
  price: number;

  @ApiProperty({ description: 'Total transaction value', example: 1507.50 })
  totalValue: number;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType, example: TransactionType.BUY })
  type: TransactionType;

  @ApiProperty({ description: 'Transaction timestamp', example: '2023-04-28T12:00:00Z' })
  timestamp: Date;
} 