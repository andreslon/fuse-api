import { Module } from '@nestjs/common';
import { DynamicModule } from '@nestjs/common';

export const InjectQueue = () => {
  return (target: any, key: string, index: number) => {
    // Do nothing, this is just a mock
  };
};

export class BullModule {
  static forRoot(options?: any): DynamicModule {
    return {
      module: BullModule,
      providers: [],
      exports: [],
    };
  }

  static registerQueue(...queues: any[]): DynamicModule {
    return {
      module: BullModule,
      providers: [],
      exports: [],
    };
  }
} 