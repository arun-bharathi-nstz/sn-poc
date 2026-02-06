import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { Customer } from '../entities/customer.entity';
import { Driver } from '../entities/driver.entity';
import { VendorLocation } from '../entities/vendor-location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      User,
      Vendor,
      Customer,
      Driver,
      VendorLocation,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
