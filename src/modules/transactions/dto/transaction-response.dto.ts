import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto, TransactionType } from './transaction.dto';

/**
 * DTO for transaction response
 */
export class TransactionResponseDto {
  @ApiProperty({ description: 'Transaction details' })
  transaction: TransactionDto;

  @ApiProperty({ description: 'Transaction status', example: 'SUCCESS' })
  status: 'SUCCESS' | 'PENDING' | 'FAILED';

  @ApiProperty({ description: 'Transaction confirmation ID', example: 'conf_12345' })
  confirmationId: string;

  @ApiProperty({ description: 'Total cost of the transaction', example: 1507.50 })
  totalCost: number;

  /**
   * Static factory method to create a successful buy transaction response
   */
  static createSuccessfulBuyResponse(transaction: TransactionDto): TransactionResponseDto {
    return {
      transaction,
      status: 'SUCCESS',
      confirmationId: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      totalCost: transaction.totalValue,
    };
  }

  /**
   * Static factory method to create a failed transaction response
   */
  static createFailedResponse(
    userId: string,
    symbol: string,
    quantity: number,
    errorReason: string
  ): TransactionResponseDto {
    const transaction: TransactionDto = {
      id: `failed_${Date.now()}`,
      userId,
      symbol,
      quantity,
      price: 0,
      totalValue: 0,
      type: TransactionType.BUY,
      timestamp: new Date(),
    };

    return {
      transaction,
      status: 'FAILED',
      confirmationId: '',
      totalCost: 0,
    };
  }
} 