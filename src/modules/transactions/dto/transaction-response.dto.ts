export class TransactionResponseDto {
  id: string;
  userId: string;
  symbol: string;
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: Date;
  status: string;
} 