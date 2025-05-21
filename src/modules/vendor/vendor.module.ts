import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VendorService } from './vendor.service';
import { MockApiProvider } from './provider/mock-api.provider';
import { FuseApiProvider } from './provider/fuse-api.provider';
import { ApiProviderFactory } from './provider/api-provider.factory';
import { ResilienceModule } from '../../core/resilience/resilience.module';
import { CacheModule } from '../../core/cache/cache.module';

/**
 * Module for external vendor/API integrations
 * Implements the Factory pattern for multiple API providers
 */
@Module({
  imports: [
    ResilienceModule,
    CacheModule,
    HttpModule.register({
      timeout: 10000, // 10 seconds
      maxRedirects: 5,
    }),
  ],
  providers: [
    VendorService,
    MockApiProvider,
    FuseApiProvider,
    ApiProviderFactory,
  ],
  exports: [VendorService],
})
export class VendorModule {} 