import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Vendor } from "./entities/vendor.entity";
import { VendorLocation } from "./entities/vendor-location.entity";
import { Driver } from "./entities/driver.entity";
import { Customer } from "./entities/customer.entity";
import { TableSemantics } from "./entities/table-semantics.entity";
import { Order } from "./entities/order.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "supplynow",
      entities: [
        User,
        Vendor,
        VendorLocation,
        Driver,
        Customer,
        TableSemantics,
        Order,
      ],
      synchronize: true, // Set to false in production
      logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
