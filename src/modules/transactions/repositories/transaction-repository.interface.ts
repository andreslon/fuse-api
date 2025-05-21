import { TransactionDto } from '../dto/transaction.dto';

/**
 * Repository interface for transaction data access
 */
export interface TransactionRepository {
  /**
   * Save a new transaction
   * @param transaction The transaction to save
   * @returns The saved transaction with ID
   */
  saveTransaction(transaction: TransactionDto): Promise<TransactionDto>;

  /**
   * Get all transactions for a user
   * @param userId The user ID
   * @returns Array of transactions
   */
  getTransactionsByUserId(userId: string): Promise<TransactionDto[]>;

  /**
   * Get a specific transaction by ID
   * @param transactionId The transaction ID
   * @returns The transaction or null if not found
   */
  getTransactionById(transactionId: string): Promise<TransactionDto | null>;
} 