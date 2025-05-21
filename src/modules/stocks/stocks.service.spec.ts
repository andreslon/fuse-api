import { Test, TestingModule } from '@nestjs/testing';
import { StocksService } from './stocks.service';
import { VendorService } from '../vendor/vendor.service';
import { CacheService } from '../../core/cache/cache.service';
import { StockDto } from './dto/stock.dto';
import { ListStocksDto } from './dto/list-stocks.dto';
import { StockNotFoundException, StockServiceUnavailableException } from '../../core/exceptions/domain/stock.exceptions';

describe('StocksService', () => {
  let service: StocksService;
  let vendorService: VendorService;
  let cacheService: CacheService;

  // Mock data
  const mockStocks: StockDto[] = [
    { symbol: 'AAPL', name: 'Apple Inc', price: 175.50, market: 'NASDAQ', lastUpdated: new Date() },
    { symbol: 'MSFT', name: 'Microsoft Corp', price: 340.25, market: 'NASDAQ', lastUpdated: new Date() },
    { symbol: 'GOOGL', name: 'Alphabet Inc', price: 131.75, market: 'NASDAQ', lastUpdated: new Date() },
    { symbol: 'AMZN', name: 'Amazon.com Inc', price: 125.30, market: 'NASDAQ', lastUpdated: new Date() },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co', price: 145.20, market: 'NYSE', lastUpdated: new Date() },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: VendorService,
          useValue: {
            getStocks: jest.fn().mockResolvedValue(mockStocks),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StocksService>(StocksService);
    vendorService = module.get<VendorService>(VendorService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPaginatedStocks', () => {
    it('should return paginated stocks', async () => {
      // Mock the cache service to return null (cache miss)
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      
      const queryParams: ListStocksDto = { offset: 0, limit: 2 };
      const result = await service.getPaginatedStocks(queryParams);
      
      expect(result.data.length).toBe(2);
      expect(result.meta.total).toBe(5);
      expect(result.meta.hasNextPage).toBe(true);
      expect(vendorService.getStocks).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should return filtered stocks by symbol', async () => {
      // Mock cache hit
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockStocks);
      
      const queryParams: ListStocksDto = { 
        offset: 0, 
        limit: 10,
        symbol: 'AA' // This should match only AAPL
      };
      
      const result = await service.getPaginatedStocks(queryParams);
      
      expect(result.data.length).toBe(1);
      expect(result.data[0].symbol).toBe('AAPL');
      expect(vendorService.getStocks).not.toHaveBeenCalled();
    });

    it('should return filtered stocks by market', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockStocks);
      
      const queryParams: ListStocksDto = { 
        offset: 0,
        limit: 10,
        market: 'NYSE'
      };
      
      const result = await service.getPaginatedStocks(queryParams);
      
      expect(result.data.length).toBe(1);
      expect(result.data[0].symbol).toBe('JPM');
    });

    it('should handle service unavailable exception', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(vendorService, 'getStocks').mockRejectedValue(new Error('API error'));
      
      await expect(service.getPaginatedStocks({ offset: 0, limit: 10 }))
        .rejects
        .toThrow(StockServiceUnavailableException);
    });
  });

  describe('getStockBySymbol', () => {
    it('should return a stock by symbol', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockStocks);
      
      const result = await service.getStockBySymbol('AAPL');
      
      expect(result).toBeDefined();
      expect(result.symbol).toBe('AAPL');
    });

    it('should throw NotFoundException when stock not found', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockStocks);
      
      await expect(service.getStockBySymbol('INVALID'))
        .rejects
        .toThrow(StockNotFoundException);
    });
  });

  describe('getStocks', () => {
    it('should get stocks from cache if available', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(mockStocks);
      
      const result = await service.getStocks();
      
      expect(result).toEqual(mockStocks);
      expect(cacheService.get).toHaveBeenCalledWith('stocks');
      expect(vendorService.getStocks).not.toHaveBeenCalled();
    });

    it('should fetch stocks from API if not in cache', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      
      const result = await service.getStocks();
      
      expect(result).toEqual(mockStocks);
      expect(vendorService.getStocks).toHaveBeenCalled();
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should throw if fetching stocks fails', async () => {
      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(vendorService, 'getStocks').mockRejectedValue(new Error('API error'));
      
      await expect(service.getStocks())
        .rejects
        .toThrow(StockServiceUnavailableException);
    });
  });
}); 