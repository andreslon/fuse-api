import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { VendorService } from '../vendor/vendor.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { TransactionRepository } from './repositories/transaction-repository.interface';
import { TransactionRepositoryImpl } from './repositories/transaction.repository';
import { BuyStockDto } from './dto/buy-stock.dto';
import { TransactionDto, TransactionType } from './dto/transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionFailedException } from '../../core/exceptions/domain/transaction.exceptions';
import { StockNotFoundException } from '../../core/exceptions/domain/stock.exceptions';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepository: TransactionRepository;
  let vendorService: VendorService;
  let portfolioService: PortfolioService;

  // Mock data
  const mockTransaction: TransactionDto = {
    id: 'tx_12345',
    userId: 'user1',
    symbol: 'AAPL',
    quantity: 5,
    price: 175.50,
    totalValue: 877.50,
    type: TransactionType.BUY,
    timestamp: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionRepositoryImpl,
          useValue: {
            saveTransaction: jest.fn().mockResolvedValue(mockTransaction),
            getTransactionsByUserId: jest.fn().mockResolvedValue([mockTransaction]),
            getTransactionById: jest.fn().mockResolvedValue(mockTransaction),
          },
        },
        {
          provide: VendorService,
          useValue: {
            getStockPrice: jest.fn().mockResolvedValue(175.50),
          },
        },
        {
          provide: PortfolioService,
          useValue: {
            getPortfolio: jest.fn().mockResolvedValue({
              userId: 'user1',
              holdings: [],
              totalValue: 0,
              lastUpdated: new Date(),
            }),
            addStockToPortfolio: jest.fn().mockResolvedValue({
              userId: 'user1',
              holdings: [{ symbol: 'AAPL', quantity: 5, averagePrice: 175.50 }],
              totalValue: 877.50,
              lastUpdated: new Date(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepository = module.get<TransactionRepository>(TransactionRepositoryImpl);
    vendorService = module.get<VendorService>(VendorService);
    portfolioService = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buyStock', () => {
    it('should process a successful stock purchase', async () => {
      const buyStockDto: BuyStockDto = {
        userId: 'user1',
        symbol: 'AAPL',
        quantity: 5,
      };

      const result = await service.buyStock(buyStockDto);
      
      expect(result).toBeDefined();
      expect(result.status).toBe('SUCCESS');
      expect(result.transaction.symbol).toBe(buyStockDto.symbol);
      expect(result.transaction.quantity).toBe(buyStockDto.quantity);
      
      // Verify that all dependencies were called
      expect(vendorService.getStockPrice).toHaveBeenCalledWith(buyStockDto.symbol);
      expect(transactionRepository.saveTransaction).toHaveBeenCalled();
      expect(portfolioService.addStockToPortfolio).toHaveBeenCalled();
    });

    it('should handle stock not found error', async () => {
      const buyStockDto: BuyStockDto = {
        userId: 'user1',
        symbol: 'INVALID',
        quantity: 5,
      };

      jest.spyOn(vendorService, 'getStockPrice').mockRejectedValue(
        new StockNotFoundException(buyStockDto.symbol)
      );

      await expect(service.buyStock(buyStockDto))
        .rejects
        .toThrow(TransactionFailedException);
    });

    it('should handle other errors during purchase', async () => {
      const buyStockDto: BuyStockDto = {
        userId: 'user1',
        symbol: 'AAPL',
        quantity: 5,
      };

      jest.spyOn(portfolioService, 'addStockToPortfolio').mockRejectedValue(
        new Error('Failed to update portfolio')
      );

      await expect(service.buyStock(buyStockDto))
        .rejects
        .toThrow(TransactionFailedException);
    });
  });

  describe('getTransactionsByUserId', () => {
    it('should return transactions for a user', async () => {
      const userId = 'user1';
      
      const result = await service.getTransactionsByUserId(userId);
      
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe(userId);
      expect(transactionRepository.getTransactionsByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return empty array when no transactions exist', async () => {
      const userId = 'user2';
      
      jest.spyOn(transactionRepository, 'getTransactionsByUserId').mockResolvedValue([]);
      
      const result = await service.getTransactionsByUserId(userId);
      
      expect(result).toHaveLength(0);
      expect(transactionRepository.getTransactionsByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('getTransactionById', () => {
    it('should return a transaction by ID', async () => {
      const transactionId = 'tx_12345';
      
      const result = await service.getTransactionById(transactionId);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(transactionId);
      expect(transactionRepository.getTransactionById).toHaveBeenCalledWith(transactionId);
    });

    it('should return null when transaction not found', async () => {
      const transactionId = 'nonexistent';
      
      jest.spyOn(transactionRepository, 'getTransactionById').mockResolvedValue(null);
      
      const result = await service.getTransactionById(transactionId);
      
      expect(result).toBeNull();
      expect(transactionRepository.getTransactionById).toHaveBeenCalledWith(transactionId);
    });
  });
}); 