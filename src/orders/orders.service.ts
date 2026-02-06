import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { Customer } from '../entities/customer.entity';
import { Driver } from '../entities/driver.entity';
import { VendorLocation } from '../entities/vendor-location.entity';

export interface RlsTestResult {
  userId: string;
  userRole: string;
  userEmail: string;
  ordersVisible: Order[];
  totalOrdersInDb: number;
  rlsWorking: boolean;
  message: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(VendorLocation)
    private vendorLocationRepository: Repository<VendorLocation>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Get all orders (without RLS - for comparison)
   */
  async getAllOrders(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['customer', 'vendor'],
    });
  }

  /**
   * Get orders with RLS applied based on user ID
   * This method sets the session variable and queries with RLS
   * NOTE: Superusers bypass RLS, so we use SET ROLE to switch to app_user
   */
  async getOrdersWithRls(userId: string): Promise<RlsTestResult> {
    // First, get the user to determine their role
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      return {
        userId,
        userRole: 'unknown',
        userEmail: 'unknown',
        ordersVisible: [],
        totalOrdersInDb: 0,
        rlsWorking: false,
        message: `User with ID ${userId} not found`,
      };
    }

    // Get total orders count (without RLS)
    const totalOrders = await this.orderRepository.count();

    // Execute query with RLS by setting the session variable
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Set the current user ID in session for RLS
      await queryRunner.query(`SET app.current_user_id = '${userId}'`);
      
      // Switch to app_user role to enforce RLS (superusers bypass RLS)
      await queryRunner.query(`SET ROLE app_user`);

      // Query orders - RLS policies will filter based on the session variable
      const ordersWithRls = await queryRunner.query(`
        SELECT 
          o.id,
          o.order_number,
          o.customer_id,
          o.vendor_id,
          o.status,
          o.total_amount,
          o."createdAt",
          o."updatedAt"
        FROM orders o
      `);
      
      // Reset role back to superuser
      await queryRunner.query(`RESET ROLE`);

      // Determine if RLS is working properly
      let expectedBehavior = '';
      let rlsWorking = true;

      switch (user.role) {
        case 'super_admin':
          expectedBehavior = 'Super admin should see all orders';
          rlsWorking = ordersWithRls.length === totalOrders;
          break;
        case 'vendor_admin':
          expectedBehavior = 'Vendor admin should see only their vendor orders';
          break;
        case 'customer':
          expectedBehavior = 'Customer should see only their own orders';
          break;
        case 'driver':
          expectedBehavior = 'Driver should see confirmed/shipped orders';
          break;
        case 'vendor_location_admin':
          expectedBehavior = 'Vendor location admin should see orders from their location vendor';
          break;
        default:
          expectedBehavior = 'Unknown role - no orders expected';
      }

      return {
        userId,
        userRole: user.role,
        userEmail: user.email,
        ordersVisible: ordersWithRls,
        totalOrdersInDb: totalOrders,
        rlsWorking,
        message: `${expectedBehavior}. Visible: ${ordersWithRls.length} of ${totalOrders} orders.`,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Test RLS by comparing results for different user roles
   */
  async testRlsForAllRoles(): Promise<{
    totalOrders: number;
    testResults: RlsTestResult[];
  }> {
    const totalOrders = await this.orderRepository.count();
    const users = await this.userRepository.find();
    const testResults: RlsTestResult[] = [];

    for (const user of users) {
      const result = await this.getOrdersWithRls(user.id);
      testResults.push(result);
    }

    return {
      totalOrders,
      testResults,
    };
  }

  /**
   * Create a test order (for testing purposes)
   */
  async createTestOrder(
    customerId: string,
    vendorId: string,
    totalAmount: number,
  ): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}`;
    const order = this.orderRepository.create({
      order_number: orderNumber,
      customer_id: customerId,
      vendor_id: vendorId,
      total_amount: totalAmount,
      status: 'pending',
    });
    return this.orderRepository.save(order);
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Get all users (for testing RLS with different roles)
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Get all vendors
   */
  async getAllVendors(): Promise<Vendor[]> {
    return this.vendorRepository.find();
  }

  /**
   * Get all customers
   */
  async getAllCustomers(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  /**
   * Get all drivers
   */
  async getAllDrivers(): Promise<Driver[]> {
    return this.driverRepository.find();
  }

  /**
   * Get all vendor locations
   */
  async getAllVendorLocations(): Promise<VendorLocation[]> {
    return this.vendorLocationRepository.find();
  }

  /**
   * Check if RLS is enabled on orders table
   */
  async checkRlsStatus(): Promise<{
    rlsEnabled: boolean;
    rlsForced: boolean;
    policies: any[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Check if RLS is enabled
      const rlsStatus = await queryRunner.query(`
        SELECT 
          relname as table_name,
          relrowsecurity as rls_enabled,
          relforcerowsecurity as rls_forced
        FROM pg_class
        WHERE relname = 'orders'
      `);

      // Get all policies on orders table
      const policies = await queryRunner.query(`
        SELECT 
          polname as policy_name,
          polcmd as command,
          polroles::regrole[] as roles,
          pg_get_expr(polqual, polrelid) as using_expression
        FROM pg_policy
        WHERE polrelid = 'orders'::regclass
      `);

      return {
        rlsEnabled: rlsStatus[0]?.rls_enabled || false,
        rlsForced: rlsStatus[0]?.rls_forced || false,
        policies,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Setup RLS policies (run this once to create policies)
   * Also creates app_user role for RLS testing (superusers bypass RLS)
   */
  async setupRlsPolicies(): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create app_user role if it doesn't exist (for RLS testing - superusers bypass RLS)
      await queryRunner.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
            CREATE ROLE app_user NOLOGIN;
          END IF;
        END
        $$;
      `);

      // Grant necessary permissions to app_user
      await queryRunner.query(`GRANT USAGE ON SCHEMA public TO app_user`);
      await queryRunner.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO app_user`);
      await queryRunner.query(`GRANT SELECT ON users TO app_user`);
      await queryRunner.query(`GRANT SELECT ON vendors TO app_user`);
      await queryRunner.query(`GRANT SELECT ON customers TO app_user`);
      await queryRunner.query(`GRANT SELECT ON drivers TO app_user`);
      await queryRunner.query(`GRANT SELECT ON vendor_locations TO app_user`);

      // Enable RLS on orders table
      await queryRunner.query(`ALTER TABLE orders ENABLE ROW LEVEL SECURITY`);
      await queryRunner.query(`ALTER TABLE orders FORCE ROW LEVEL SECURITY`);

      // Drop ALL existing policies on orders table
      const existingPoliciesResult = await queryRunner.query(`
        SELECT polname FROM pg_policy WHERE polrelid = 'orders'::regclass
      `);
      
      for (const row of existingPoliciesResult) {
        await queryRunner.query(`DROP POLICY IF EXISTS "${row.polname}" ON orders`);
      }

      // Create Vendor Admin Policy - ONLY for vendor_admin role
      await queryRunner.query(`
        CREATE POLICY vendor_orders_policy ON orders
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = current_setting('app.current_user_id', true)::uuid
            AND u.role = 'vendor_admin'
            AND (
              orders.vendor_id = u.vendor_id::uuid
              OR orders.vendor_id IN (
                SELECT v.id FROM vendors v WHERE v.user_id = u.id
              )
            )
          )
        )
      `);

      // Create Customer Policy - ONLY for customer role
      await queryRunner.query(`
        CREATE POLICY customer_orders_policy ON orders
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM users u
            JOIN customers c ON c.user_id = u.id
            WHERE u.id = current_setting('app.current_user_id', true)::uuid
            AND u.role = 'customer'
            AND orders.customer_id = c.id
          )
        )
      `);

      // Create Driver Policy - ONLY for driver role
      await queryRunner.query(`
        CREATE POLICY driver_orders_policy ON orders
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM users u
            JOIN drivers d ON d.user_id = u.id
            WHERE u.id = current_setting('app.current_user_id', true)::uuid
            AND u.role = 'driver'
            AND d.is_active = true
            AND orders.driver_id = d.id
          )
        )
      `);

      // Create Vendor Location Admin Policy - ONLY for vendor_location_admin role
      await queryRunner.query(`
        CREATE POLICY vendor_location_admin_orders_policy ON orders
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = current_setting('app.current_user_id', true)::uuid
            AND u.role = 'vendor_location_admin'
            AND orders.vendor_location_id = u.vendor_location_id::uuid
          )
        )
      `);

      // Create Super Admin Policy
      await queryRunner.query(`
        CREATE POLICY super_admin_orders_policy ON orders
        FOR ALL
        USING (
          EXISTS (
            SELECT 1 
            FROM users u 
            WHERE u.id = current_setting('app.current_user_id', true)::uuid
            AND u.role = 'super_admin'
          )
        )
      `);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: 'RLS policies created successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return {
        success: false,
        message: `Failed to create RLS policies: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    } finally {
      await queryRunner.release();
    }
  }
}
