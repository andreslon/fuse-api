import { Injectable, Logger } from '@nestjs/common';
import { ApiProvider } from './api-provider.interface';
import { MockApiProvider } from './mock-api.provider';
import { FuseApiProvider } from './fuse-api.provider';

/**
 * Factory for creating API providers
 * Allows for easy switching between different API providers
 */
@Injectable()
export class ApiProviderFactory {
  private readonly logger = new Logger(ApiProviderFactory.name);
  private readonly providers = new Map<string, ApiProvider>();
  private defaultProvider: string;

  constructor(
    private readonly mockApiProvider: MockApiProvider,
    private readonly fuseApiProvider: FuseApiProvider,
  ) {
    // Register providers
    this.registerProvider(mockApiProvider);
    this.registerProvider(fuseApiProvider);
    
    // Set default provider to Fuse API
    this.defaultProvider = fuseApiProvider.getName();
  }

  /**
   * Register a provider
   */
  registerProvider(provider: ApiProvider): void {
    const name = provider.getName();
    this.providers.set(name, provider);
    this.logger.log(`Registered API provider: ${name}`);
  }

  /**
   * Get a provider by name or default if not found
   */
  getProvider(name?: string): ApiProvider {
    if (name && this.providers.has(name)) {
      return this.providers.get(name)!;
    }
    
    // Return default provider
    const provider = this.providers.get(this.defaultProvider)!;
    
    if (!name) {
      this.logger.debug(`Using default provider: ${this.defaultProvider}`);
    } else {
      this.logger.warn(`Provider '${name}' not found, using default: ${this.defaultProvider}`);
    }
    
    return provider;
  }

  /**
   * Set the default provider
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' is not registered`);
    }
    
    this.defaultProvider = name;
    this.logger.log(`Default provider set to: ${name}`);
  }

  /**
   * Get names of all registered providers
   */
  getProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }
} 