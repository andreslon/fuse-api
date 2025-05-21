import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { VendorModule } from '../vendor/vendor.module';
import { StocksModule } from '../stocks/stocks.module';
import { CacheModule } from '../../core/cache/cache.module';
import { TransactionRepository } from './repository/transaction.repository';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { TransactionRepositoryImpl } from './repositories/transaction.repository';

@Module({
  imports: [VendorModule, StocksModule, CacheModule, PortfolioModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService, 
    TransactionRepository,
    {
      provide: TransactionRepositoryImpl,
      useFactory: (repository: TransactionRepository) => {
        return {
          saveTransaction: (transaction: any) => repository.save({
            transaction: transaction,
            status: 'SUCCESS',
            confirmationId: `conf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            totalCost: transaction.totalValue
          }),
          getTransactionsByUserId: (userId: string) => 
            repository.findAllByUserId(userId)
              .then(responses => responses.map(r => r.transaction)),
          getTransactionById: (transactionId: string) => 
            repository.findAllByUserId('')
              .then(responses => {
                const match = responses.find(r => r.transaction.id === transactionId);
                return match ? match.transaction : null;
              })
        };
      },
      inject: [TransactionRepository]
    }
  ],
  exports: [TransactionsService, TransactionRepository, TransactionRepositoryImpl],
})
export class TransactionsModule {} 