import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { MockApiProvider } from './provider/mock-api.provider';
import { ApiProviderFactory } from './provider/api-provider.factory';
import { ResilienceModule } from '../../core/resilience/resilience.module';

/**
 * Module for external vendor/API integrations
 * Implements the Factory pattern for multiple API providers
 */
@Module({
  imports: [ResilienceModule],
  providers: [
    VendorService,
    MockApiProvider,
    ApiProviderFactory,
  ],
  exports: [VendorService],
})
export class VendorModule {} 