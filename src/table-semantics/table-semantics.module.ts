import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableSemanticsService } from './table-semantics.service';
import { TableSemanticsController } from './table-semantics.controller';
import { TableSemantics } from '../entities/table-semantics.entity';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { VendorLocation } from '../entities/vendor-location.entity';
import { Driver } from '../entities/driver.entity';
import { Customer } from '../entities/customer.entity';
import { Order } from '../entities/order.entity';
import { AiService } from '../ai/ai.service';

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
export class TableSemanticsModule {}
