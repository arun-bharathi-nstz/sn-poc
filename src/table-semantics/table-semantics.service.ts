import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TableSemantics } from '../entities/table-semantics.entity';
import { User } from '../entities/user.entity';
import { Vendor } from '../entities/vendor.entity';
import { VendorLocation } from '../entities/vendor-location.entity';
import { Driver } from '../entities/driver.entity';
import { Customer } from '../entities/customer.entity';
import { Order } from '../entities/order.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TableSemanticsService {
  private tableRepositories: { [key: string]: Repository<any> };

  constructor(
    @InjectRepository(TableSemantics)
    private readonly tableSemanticsRepository: Repository<TableSemantics>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorLocation)
    private readonly vendorLocationRepository: Repository<VendorLocation>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly aiService: AiService,
  ) {
    this.tableRepositories = {
      users: this.userRepository,
      vendors: this.vendorRepository,
      vendor_locations: this.vendorLocationRepository,
      drivers: this.driverRepository,
      customers: this.customerRepository,
      orders: this.orderRepository,
    };
  }

  /**
   * Generate embeddings for all table semantics and all tables
   */
  async generateAllEmbeddings() {
    const tableResult = await this.generateEmbeddingForTableSemantics();
    const tableDataResults: any[] = [];

    for (const [tableName, repo] of Object.entries(this.tableRepositories)) {
      const result = await this.generateEmbeddingForTable(tableName, repo);
      tableDataResults.push(result);
    }

    return {
      success: true,
      tableSemantics: tableResult,
      tables: tableDataResults,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate embedding for table_semantics records
   * Always overwrites old embeddings
   */
  private async generateEmbeddingForTableSemantics() {
    const tables = await this.tableSemanticsRepository.find();
    let successCount = 0;
    let embeddingDimension = 0;

    for (const table of tables) {
      try {
        const oldDimension = table.embed?.length || 0;
        const text = `Table: ${table.name}\nType: ${table.type}\n` +
          (table.description ? `Description: ${table.description}\n` : '') +
          `Columns: ${table.columns.join(', ')}`;

        const embedding = await this.aiService.textToEmbedding(text);
        table.embed = embedding.embedding;

        await this.tableSemanticsRepository.save(table);
        successCount++;
        embeddingDimension = embedding.embedding.length;

        console.log(`✓ TableSemantics embedding updated for ${table.name} (old: ${oldDimension}, new: ${embeddingDimension})`);
      } catch (err) {
        console.error(`✗ Failed for TableSemantics: ${table.name}`, err);
      }
    }

    return {
      tableName: 'table_semantics',
      recordsProcessed: successCount,
      embeddingGenerated: successCount > 0,
      embeddingDimension,
    };
  }

  /**
   * Generic embedding generator for any table
   */
  private async generateEmbeddingForTable(tableName: string, repo: Repository<any>) {
    const rows = await repo.find();
    let successCount = 0;
    let embeddingDimension = 0;

    for (const row of rows) {
      try {
        const oldDimension = row.embed?.length || 0;
        // Convert row to text
        const text = Object.entries(row)
          .filter(([k, v]) => k !== 'embed' && k !== 'id' && v !== undefined)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');

        const embedding = await this.aiService.textToEmbedding(text);
        row.embed = embedding.embedding;

        await repo.save(row);
        successCount++;
        embeddingDimension = embedding.embedding.length;

        console.log(`✓ ${tableName} embedding updated for id: ${row.id} (old: ${oldDimension}, new: ${embeddingDimension})`);
      } catch (err) {
        console.error(`✗ Failed for ${tableName} id: ${row.id}`, err);
      }
    }

    return {
      tableName,
      recordsProcessed: successCount,
      embeddingGenerated: successCount > 0,
      embeddingDimension,
    };
  }

  /**
   * Initialize table semantics with correct column names and descriptions
   * This resets all table semantics and regenerates embeddings
   */
  async initializeTableSemantics() {
    // Delete all existing
    await this.tableSemanticsRepository.clear();

    // Define all tables
    const tables = [
      {
        name: 'vendors',
        type: 'table',
        description: 'Vendor companies that provide products and services. Each vendor is associated with a user who manages it.',
        columns: ['id', 'name', 'email', 'phone', 'is_active', 'user_id', 'created_at', 'updated_at'],
      },
      {
        name: 'vendor_locations',
        type: 'table',
        description: 'Physical store locations for vendors with address, coordinates, and contact information. Each location belongs to a vendor.',
        columns: ['id', 'name', 'address', 'city', 'state', 'zip', 'latitude', 'longitude', 'phone', 'is_active', 'vendor_id', 'created_at', 'updated_at'],
      },
      {
        name: 'orders',
        type: 'table',
        description: 'Customer orders containing order details, amounts, status, and relationships to vendors, customers, drivers, and vendor locations.',
        columns: ['id', 'order_number', 'customer_id', 'vendor_id', 'driver_id', 'vendor_location_id', 'status', 'total_amount', 'created_at', 'updated_at'],
      },
      {
        name: 'customers',
        type: 'table',
        description: 'Customer accounts for placing and managing orders.',
        columns: ['id', 'name', 'phone', 'is_active', 'user_id', 'created_at', 'updated_at'],
      },
      {
        name: 'drivers',
        type: 'table',
        description: 'Delivery drivers with license information, vehicle details, and availability status.',
        columns: ['id', 'license_number', 'license_expiry_date', 'vehicle_number', 'vehicle_type', 'is_available', 'is_active', 'user_id', 'created_at', 'updated_at'],
      },
      {
        name: 'users',
        type: 'table',
        description: 'System users with different roles: super_admin, vendor_admin, vendor_location_admin, driver, customer',
        columns: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'vendor_id', 'vendor_location_id', 'created_at', 'updated_at'],
      },
    ];

    // Insert all tables
    let successCount = 0;
    for (const tableConfig of tables) {
      try {
        await this.tableSemanticsRepository.save({
          name: tableConfig.name,
          type: tableConfig.type as 'table' | 'materialized_view',
          description: tableConfig.description,
          columns: tableConfig.columns,
        });
        successCount++;
        console.log(`✓ Initialized table semantics: ${tableConfig.name}`);
      } catch (err) {
        console.error(`✗ Failed to initialize ${tableConfig.name}:`, err);
      }
    }

    return {
      success: true,
      tablesInitialized: successCount,
      message: 'Call POST /table-semantics/generate-embedding to create embeddings',
    };
  }

  /**
   * Get all table semantics with embedding info
   */
  async getAllTableSemantics() {
    const allTables = await this.tableSemanticsRepository.find();
    return allTables.map((table) => ({
      id: table.id,
      name: table.name,
      description: table.description,
      columns: table.columns,
      hasEmbedding: !!(table.embed?.length),
      embeddingDimension: table.embed?.length || 0,
    }));
  }
}
