import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AiService } from '../ai/ai.service';
import { Customer, Driver, Order, TableSemantics, User, Vendor, VendorLocation } from 'src/entities';

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
