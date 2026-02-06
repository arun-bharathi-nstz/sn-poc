import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService, RlsTestResult } from './orders.service';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { Customer } from '../entities/customer.entity';
import { Driver } from '../entities/driver.entity';
import { VendorLocation } from '../entities/vendor-location.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /orders
   * Get all orders without RLS (admin view)
   */
  @Get()
  async getAllOrders(): Promise<Order[]> {
    return this.ordersService.getAllOrders();
  }

  /**
   * GET /orders/rls-test
   * Test RLS by passing a user ID
   * Query params: userId (required)
   * 
   * Example: GET /orders/rls-test?userId=<uuid>
   */
  @Get('rls-test')
  async testRls(@Query('userId') userId: string): Promise<RlsTestResult> {
    if (!userId) {
      throw new HttpException(
        'userId query parameter is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.ordersService.getOrdersWithRls(userId);
  }

  /**
   * GET /orders/rls-test-all
   * Test RLS for all users in the system
   * Returns results for each user showing what orders they can see
   */
  @Get('rls-test-all')
  async testRlsForAllRoles(): Promise<{
    totalOrders: number;
    testResults: RlsTestResult[];
  }> {
    return this.ordersService.testRlsForAllRoles();
  }

  /**
   * GET /orders/rls-status
   * Check if RLS is enabled on the orders table and list all policies
   */
  @Get('rls-status')
  async checkRlsStatus(): Promise<{
    rlsEnabled: boolean;
    rlsForced: boolean;
    policies: any[];
  }> {
    return this.ordersService.checkRlsStatus();
  }

  /**
   * POST /orders/setup-rls
   * Setup RLS policies on the orders table
   * This should be called once to initialize RLS
   */
  @Post('setup-rls')
  async setupRlsPolicies(): Promise<{ success: boolean; message: string }> {
    return this.ordersService.setupRlsPolicies();
  }

  /**
   * POST /orders/create-test
   * Create a test order for RLS testing
   * Body: { customerId: string, vendorId: string, totalAmount: number }
   */
  @Post('create-test')
  async createTestOrder(
    @Body()
    body: {
      customerId: string;
      vendorId: string;
      totalAmount: number;
    },
  ): Promise<Order> {
    const { customerId, vendorId, totalAmount } = body;
    if (!customerId || !vendorId) {
      throw new HttpException(
        'customerId and vendorId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.ordersService.createTestOrder(
      customerId,
      vendorId,
      totalAmount || 100,
    );
  }

  /**
   * GET /orders/users
   * Get all users (for selecting user ID to test RLS)
   */
  @Get('users')
  async getAllUsers(): Promise<User[]> {
    return this.ordersService.getAllUsers();
  }

  /**
   * GET /orders/vendors
   * Get all vendors
   */
  @Get('vendors')
  async getAllVendors(): Promise<Vendor[]> {
    return this.ordersService.getAllVendors();
  }

  /**
   * GET /orders/customers
   * Get all customers
   */
  @Get('customers')
  async getAllCustomers(): Promise<Customer[]> {
    return this.ordersService.getAllCustomers();
  }

  /**
   * GET /orders/drivers
   * Get all drivers
   */
  @Get('drivers')
  async getAllDrivers(): Promise<Driver[]> {
    return this.ordersService.getAllDrivers();
  }

  /**
   * GET /orders/vendor-locations
   * Get all vendor locations
   */
  @Get('vendor-locations')
  async getAllVendorLocations(): Promise<VendorLocation[]> {
    return this.ordersService.getAllVendorLocations();
  }
}
