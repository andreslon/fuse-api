import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { VendorModule } from '../vendor/vendor.module';
import { StocksModule } from '../stocks/stocks.module';
import { CacheModule } from '../../core/cache/cache.module';
import { TransactionRepository } from './repository/transaction.repository';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { TransactionRepositoryImpl } from './repositories/transaction.repository';
import { Transaction } from './entities/transaction.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    StocksModule,
    PortfolioModule,
    VendorModule,
    CacheModule,
    UsersModule,
  ],
  controllers: [TransactionsController],
  providers: [
    TransactionsService, 
    TransactionRepository,
    {
      provide: TransactionRepositoryImpl,
      useClass: TransactionRepositoryImpl,
    }
  ],
  exports: [TransactionsService, TransactionRepository, TransactionRepositoryImpl],
})
export class TransactionsModule {} 