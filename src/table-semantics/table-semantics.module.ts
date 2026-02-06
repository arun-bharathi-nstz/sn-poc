import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableSemanticsService } from './table-semantics.service';
import { TableSemanticsController } from './table-semantics.controller';
import { TableSemantics } from '../entities/table-semantics.entity';
import { User } from '../entities/user.entity';
import { AiService } from '../ai/ai.service';
import { Customer, Driver, Order, VendorLocation, Vendor } from 'src/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TableSemantics,
      User,
      Vendor,
      VendorLocation,
      Driver,
      Customer,
      Order,
    ]),
  ],
  controllers: [TableSemanticsController],
  providers: [TableSemanticsService, AiService],
  exports: [TableSemanticsService],
})
export class TableSemanticsModule { }
