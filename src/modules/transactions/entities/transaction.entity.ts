import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { TransactionType } from '../dto/transaction.dto';

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'symbol' })
  @Index()
  symbol: string;

  @Column({ name: 'quantity', type: 'numeric', precision: 10, scale: 2 })
  quantity: number;

  @Column({ name: 'price', type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'total_value', type: 'numeric', precision: 10, scale: 2 })
  totalValue: number;

  @Column({
    name: 'type',
    type: 'enum',
    enum: TransactionType,
    enumName: 'transaction_type',
    default: TransactionType.BUY,
  })
  type: TransactionType;

  @Column({ name: 'confirmation_id', nullable: true })
  confirmationId: string;

  @Column({ name: 'status', default: 'SUCCESS' })
  status: string;
} 