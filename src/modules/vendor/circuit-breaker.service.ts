import { Injectable, Logger } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { StockServiceUnavailableException } from '../../core/exceptions/domain/stock.exceptions';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();
  
  // Circuit breaker default options
  private readonly defaultOptions: CircuitBreaker.Options = {
    // Number of failures before opening the circuit
    errorThresholdPercentage: 50,
    // Time in ms to wait before trying again when the circuit is open
    resetTimeout: 10000, // 10 seconds
    // Time in ms to wait before rejecting the request
    timeout: 5000, // 5 seconds
    // Allowed number of half-open requests
    rollingCountTimeout: 60000, // 1 minute
    // Volume of requests before calculating error percentage
    rollingCountBuckets: 10,
    // Option to log all errors instead of just when state changes
    // Default is false
    verbose: false,
  };

  /**
   * Create a circuit breaker for a specific action
   * @param name Unique name for the circuit (e.g., 'getStocks', 'buyStock')
   * @param func The function to execute and protect with the circuit breaker
   * @param options Optional custom circuit breaker options
   */
  create<T>(
    name: string,
    func: (...args: any[]) => Promise<T>,
    options?: Partial<CircuitBreaker.Options>,
  ): CircuitBreaker {
    // Check if circuit breaker already exists
    if (this.breakers.has(name)) {
      return this.breakers.get(name);
    }

    // Create circuit breaker with merged options
    const circuitOptions = { ...this.defaultOptions, ...options };
    const breaker = new CircuitBreaker(func, circuitOptions);

    // Setup event listeners for monitoring
    this.setupEventListeners(name, breaker);

    // Store and return the circuit breaker
    this.breakers.set(name, breaker);
    return breaker;
  }

  /**
   * Execute a function through a circuit breaker
   * Creates the circuit breaker if it doesn't exist
   */
  async execute<T>(
    name: string,
    func: (...args: any[]) => Promise<T>,
    args: any[] = [],
    options?: Partial<CircuitBreaker.Options>,
  ): Promise<T> {
    const breaker = this.create(name, func, options);

    try {
      return await breaker.fire(...args);
    } catch (error) {
      this.logger.error(`Circuit '${name}' error: ${error.message}`);
      
      // If circuit is open, throw a more specific error
      if (breaker.status.state === 'open') {
        throw new StockServiceUnavailableException(
          `Service unavailable (circuit breaker open): ${error.message}`,
        );
      }
      
      // Otherwise, rethrow the original error
      throw error;
    }
  }

  /**
   * Setup event listeners for the circuit breaker
   */
  private setupEventListeners(name: string, breaker: CircuitBreaker): void {
    breaker.on('open', () => {
      this.logger.warn(`Circuit '${name}' opened`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit '${name}' closed`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit '${name}' half-open, testing the connection`);
    });

    breaker.on('fallback', (result) => {
      this.logger.warn(`Circuit '${name}' fallback called`);
    });

    breaker.on('timeout', (result) => {
      this.logger.warn(`Circuit '${name}' timed out`);
    });

    breaker.on('reject', () => {
      this.logger.warn(`Circuit '${name}' rejected the request (circuit open)`);
    });
  }

  /**
   * Get the status of a specific circuit breaker
   */
  getStatus(name: string): CircuitBreaker.Status | null {
    const breaker = this.breakers.get(name);
    return breaker ? breaker.status : null;
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatus(): Map<string, CircuitBreaker.Status> {
    const statuses = new Map<string, CircuitBreaker.Status>();
    
    this.breakers.forEach((breaker, name) => {
      statuses.set(name, breaker.status);
    });
    
    return statuses;
  }
} 