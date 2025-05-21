import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'name', nullable: true })
  name: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'created_from_transaction', default: false })
  createdFromTransaction: boolean;
} 