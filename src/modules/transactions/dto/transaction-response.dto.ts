import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;
  
  @ApiProperty({ description: 'User ID', example: 'user1' })
  userId: string;
  
  @ApiProperty({ description: 'Stock symbol', example: 'AAPL' })
  symbol: string;
  
  @ApiProperty({ description: 'Number of shares purchased', example: 5 })
  quantity: number;
  
  @ApiProperty({ description: 'Price per share at the time of purchase', example: 150.75 })
  price: number;
  
  @ApiProperty({ description: 'Total transaction amount', example: 753.75 })
  totalAmount: number;
  
  @ApiProperty({ description: 'Transaction timestamp', example: '2023-07-15T10:30:45Z' })
  timestamp: Date;
  
  @ApiProperty({ description: 'Transaction status', example: 'completed', enum: ['pending', 'completed', 'failed'] })
  status: string;
} 