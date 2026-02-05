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
    // Map table names to their repositories
    this.tableRepositories = {
      user: this.userRepository,
      vendor: this.vendorRepository,
      vendor_location: this.vendorLocationRepository,
      driver: this.driverRepository,
      customer: this.customerRepository,
      order: this.orderRepository,
    };
  }

  /**
   * Generate embeddings for table_semantics table
   * Fetches all table semantics records, converts them to text,
   * generates embeddings, and stores them in the embed column
   */
  async generateTableSemanticsEmbeddings(): Promise<{
    success: boolean;
    tableName: string;
    recordsProcessed: number;
    embeddingGenerated: boolean;
    embeddingDimension: number;
    timestamp: string;
  }> {
    try {
      const result = await this.generateEmbeddingForTableSemantics();
      return {
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        tableName: 'table_semantics',
        recordsProcessed: 0,
        embeddingGenerated: false,
        embeddingDimension: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate embedding for table_semantics table
   * Fetches all table semantics records, generates individual embeddings for each,
   * and stores them in the embed column
   */
  private async generateEmbeddingForTableSemantics(): Promise<{
    tableName: string;
    recordsProcessed: number;
    embeddingGenerated: boolean;
    embeddingDimension: number;
  }> {
    // Fetch all table semantics records
    const allTableSemantics = await this.tableSemanticsRepository.find();

    if (allTableSemantics.length === 0) {
      return {
        tableName: 'table_semantics',
        recordsProcessed: 0,
        embeddingGenerated: false,
        embeddingDimension: 0,
      };
    }

    let embeddingDimension = 0;
    let successCount = 0;

    // Generate embedding for each table semantics record individually
    for (const tableSemantics of allTableSemantics) {
      try {
        // Convert individual table to text
        const tableText = `Table: ${tableSemantics.name}\n` +
          `Type: ${tableSemantics.type}\n` +
          (tableSemantics.description
            ? `Description: ${tableSemantics.description}\n`
            : '') +
          `Columns: ${tableSemantics.columns.join(', ')}\n`;

        // Generate embedding for this table
        const embeddingResult = await this.aiService.textToEmbedding(tableText);

        // Store embedding in the record
        tableSemantics.embed = embeddingResult.embedding;
        await this.tableSemanticsRepository.save(tableSemantics);

        embeddingDimension = embeddingResult.embedding.length;
        successCount++;

        console.log(
          `✓ Generated embedding for table: ${tableSemantics.name}`,
        );
      } catch (error) {
        console.error(
          `✗ Failed to generate embedding for table: ${tableSemantics.name}`,
          error,
        );
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
   * Get all table semantics with their current embedding status
   */
  async getAllTableSemantics(): Promise<
    Array<{
      id: string;
      name: string;
      description: string | undefined;
      columns: string[];
      hasEmbedding: boolean;
      embeddingDimension: number;
    }>
  > {
    const allTables = await this.tableSemanticsRepository.find();

    return allTables.map((table) => ({
      id: table.id,
      name: table.name,
      description: table.description,
      columns: table.columns,
      hasEmbedding: !!(table.embed && table.embed.length > 0),
      embeddingDimension: table.embed?.length || 0,
    }));
  }
}
