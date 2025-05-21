import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PortfolioDto } from './dto/portfolio.dto';
import { PortfolioRepository } from './repositories/portfolio-repository.interface';
import { PortfolioRepositoryImpl } from './repositories/portfolio.repository';
import { StocksService } from '../stocks/stocks.service';
import { NotFoundException } from '@nestjs/common';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let portfolioRepository: PortfolioRepository;
  let stocksService: StocksService;

  // Mock data
  const mockPortfolio: PortfolioDto = {
    userId: 'user1',
    holdings: [
      { symbol: 'AAPL', quantity: 10, averagePrice: 150.0 },
      { symbol: 'MSFT', quantity: 5, averagePrice: 300.0 },
    ],
    totalValue: 3000.0,
    lastUpdated: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: PortfolioRepositoryImpl,
          useValue: {
            getPortfolio: jest.fn().mockResolvedValue(mockPortfolio),
            updatePortfolio: jest.fn().mockImplementation((userId, portfolio) => Promise.resolve(portfolio)),
          },
        },
        {
          provide: StocksService,
          useValue: {
            getStockBySymbol: jest.fn().mockImplementation((symbol) => {
              if (symbol === 'AAPL') {
                return Promise.resolve({ 
                  symbol: 'AAPL', 
                  name: 'Apple Inc', 
                  price: 175.50, 
                  market: 'NASDAQ',
                  lastUpdated: new Date()
                });
              } else if (symbol === 'MSFT') {
                return Promise.resolve({ 
                  symbol: 'MSFT', 
                  name: 'Microsoft Corp', 
                  price: 340.25,
                  market: 'NASDAQ',
                  lastUpdated: new Date()
                });
              }
              return Promise.reject(new NotFoundException(`Stock ${symbol} not found`));
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    portfolioRepository = module.get<PortfolioRepository>(PortfolioRepositoryImpl);
    stocksService = module.get<StocksService>(StocksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPortfolio', () => {
    it('should return a user portfolio', async () => {
      const userId = 'user1';
      const result = await service.getPortfolio(userId);
      
      expect(result).toEqual(mockPortfolio);
      expect(portfolioRepository.getPortfolio).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when portfolio not found', async () => {
      const userId = 'nonexistent';
      jest.spyOn(portfolioRepository, 'getPortfolio').mockRejectedValue(
        new NotFoundException(`Portfolio not found for user: ${userId}`)
      );
      
      await expect(service.getPortfolio(userId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('updatePortfolioValue', () => {
    it('should update portfolio with current stock prices', async () => {
      const userId = 'user1';
      const result = await service.updatePortfolioValue(userId);
      
      expect(result.totalValue).toBeGreaterThan(0);
      expect(stocksService.getStockBySymbol).toHaveBeenCalledTimes(2);
      expect(portfolioRepository.updatePortfolio).toHaveBeenCalled();
    });

    it('should handle stock price lookup errors', async () => {
      const userId = 'user1';
      jest.spyOn(stocksService, 'getStockBySymbol').mockRejectedValue(
        new Error('Failed to fetch stock price')
      );
      
      await expect(service.updatePortfolioValue(userId))
        .rejects
        .toThrow(Error);
    });
  });

  describe('addStockToPortfolio', () => {
    it('should add a new stock to portfolio', async () => {
      const userId = 'user1';
      const symbol = 'GOOGL';
      const quantity = 2;
      const price = 130.75;
      
      // Mock the getPortfolio method to return the mock portfolio
      jest.spyOn(portfolioRepository, 'getPortfolio').mockResolvedValue(mockPortfolio);
      
      // Mock the updatePortfolio method to return the updated portfolio
      jest.spyOn(portfolioRepository, 'updatePortfolio').mockImplementation(
        (userId, portfolio) => Promise.resolve(portfolio)
      );
      
      const result = await service.addStockToPortfolio(userId, symbol, quantity, price);
      
      // Check if the new stock was added
      const newHolding = result.holdings.find(h => h.symbol === symbol);
      expect(newHolding).toBeDefined();
      expect(newHolding?.quantity).toBe(quantity);
      expect(newHolding?.averagePrice).toBe(price);
      
      // Verify repository was called with correct parameters
      expect(portfolioRepository.updatePortfolio).toHaveBeenCalled();
    });

    it('should update existing stock in portfolio', async () => {
      const userId = 'user1';
      const symbol = 'AAPL'; // Already exists in mockPortfolio
      const quantity = 5;
      const price = 180.0;
      
      // Calculate expected new average price
      const existingHolding = mockPortfolio.holdings.find(h => h.symbol === symbol)!;
      const totalShares = existingHolding.quantity + quantity;
      const totalCost = (existingHolding.quantity * existingHolding.averagePrice) + (quantity * price);
      const expectedAvgPrice = totalCost / totalShares;
      
      const result = await service.addStockToPortfolio(userId, symbol, quantity, price);
      
      // Find the updated holding
      const updatedHolding = result.holdings.find(h => h.symbol === symbol)!;
      
      // Check if the stock was updated correctly
      expect(updatedHolding.quantity).toBe(totalShares);
      expect(updatedHolding.averagePrice).toBeCloseTo(expectedAvgPrice, 2);
      
      // Verify repository was called
      expect(portfolioRepository.updatePortfolio).toHaveBeenCalled();
    });
  });
}); 