import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

/**
 * Service that provides circuit breaker functionality
 * Uses opossum library to implement the circuit breaker pattern
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly breakers = new Map<string, CircuitBreaker>();
  
  // Default circuit breaker options
  private readonly defaultOptions = {
    timeout: 5000, // 5 seconds
    errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
    resetTimeout: 30000, // 30 seconds before attempting to close circuit
    rollingCountTimeout: 10000, // 10 second window for error rate calculation
    rollingCountBuckets: 10, // 10 buckets of 1 second each
  };

  /**
   * Execute a function with circuit breaker protection
   * @param breakerId Unique identifier for the breaker
   * @param fn Function to execute with protection
   * @param options Optional custom circuit breaker options
   * @returns Result of the executed function
   */
  async executeWithBreaker<T>(
    breakerId: string,
    fn: () => Promise<T>,
    options?: CircuitBreaker.Options,
  ): Promise<T> {
    const breaker = this.getOrCreateBreaker(breakerId, options);
    return breaker.fire(fn);
  }

  /**
   * Get or create a circuit breaker for a specific ID
   */
  private getOrCreateBreaker(
    breakerId: string,
    options?: CircuitBreaker.Options,
  ): CircuitBreaker {
    if (!this.breakers.has(breakerId)) {
      const breaker = new CircuitBreaker(async (fn: () => Promise<any>) => fn(), {
        ...this.defaultOptions,
        ...options,
        name: breakerId,
      });

      // Set up event listeners
      this.setupEventListeners(breaker);
      
      // Store for reuse
      this.breakers.set(breakerId, breaker);
      this.logger.log(`Created circuit breaker: ${breakerId}`);
    }

    return this.breakers.get(breakerId)!;
  }

  /**
   * Set up event listeners for circuit breaker
   */
  private setupEventListeners(breaker: CircuitBreaker): void {
    const name = breaker.name;

    breaker.on('open', () => {
      this.logger.warn(`Circuit ${name} opened - stopping further requests`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit ${name} closed - resuming normal operation`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit ${name} half-open - testing for service availability`);
    });

    breaker.on('fallback', (result) => {
      this.logger.warn(`Circuit ${name} fallback executed`);
    });

    breaker.on('timeout', (result) => {
      this.logger.warn(`Circuit ${name} timeout after ${this.defaultOptions.timeout}ms`);
    });
  }

  /**
   * Get the state of a specific circuit breaker
   * @param breakerId Unique identifier for the breaker
   * @returns Circuit state or undefined if breaker doesn't exist
   */
  getCircuitState(breakerId: string): string | undefined {
    const breaker = this.breakers.get(breakerId);
    return breaker?.status.state;
  }

  /**
   * Get the state of all circuit breakers
   * @returns Map of breaker IDs to their states
   */
  getAllCircuitStates(): Record<string, string> {
    const states: Record<string, string> = {};
    
    this.breakers.forEach((breaker, id) => {
      states[id] = breaker.status.state;
    });
    
    return states;
  }

  /**
   * Manually reset a specific circuit breaker
   * @param breakerId Unique identifier for the breaker
   * @returns True if the breaker was reset, false if it doesn't exist
   */
  resetCircuit(breakerId: string): boolean {
    const breaker = this.breakers.get(breakerId);
    
    if (breaker) {
      breaker.close();
      this.logger.log(`Manually reset circuit breaker: ${breakerId}`);
      return true;
    }
    
    return false;
  }
} 