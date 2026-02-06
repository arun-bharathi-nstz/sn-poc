import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Vendor } from './vendor.entity';
import { Driver } from './driver.entity';
import { VendorLocation } from './vendor-location.entity';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  order_number!: string;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ nullable: true })
  customer_id?: string;

  @ManyToOne(() => Vendor, { nullable: true })
  @JoinColumn({ name: 'vendor_id' })
  vendor?: Vendor;

  @Column({ nullable: true })
  vendor_id?: string;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver?: Driver;

  @Column({ nullable: true })
  driver_id?: string;

  @ManyToOne(() => VendorLocation, { nullable: true })
  @JoinColumn({ name: 'vendor_location_id' })
  vendorLocation?: VendorLocation;

  @Column({ nullable: true })
  vendor_location_id?: string;

  @Column({
    type: 'varchar',
    default: 'pending',
  })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'vector', length: 1536, nullable: true })
  embed?: number[];
}
