import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';

/**
 * Module for resilience patterns like circuit breaker, retry, etc.
 */
@Module({
  providers: [CircuitBreakerService],
  exports: [CircuitBreakerService],
})
export class ResilienceModule {} 