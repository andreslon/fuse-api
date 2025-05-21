import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { RootModule } from './root/root.module';

@Module({
  imports: [HealthModule, RootModule],
})
export class AppModule {}
