import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserRepositoryImpl } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UsersService,
    UserRepositoryImpl,
  ],
  exports: [UsersService],
})
export class UsersModule {} 