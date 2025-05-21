import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';

@Entity('portfolios')
export class Portfolio extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'symbol' })
  @Index()
  symbol: string;

  @Column({ name: 'quantity', type: 'numeric', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ name: 'average_price', type: 'numeric', precision: 10, scale: 2, default: 0 })
  averagePrice: number;

  @Column({ name: 'total_value', type: 'numeric', precision: 10, scale: 2, default: 0 })
  totalValue: number;
} 