import { Controller, Post, Get } from '@nestjs/common';
import { TableSemanticsService } from './table-semantics.service';

@Controller('table-semantics')
export class TableSemanticsController {
  constructor(private readonly tableSemanticsService: TableSemanticsService) { }

  /**
   * Generate embeddings for table_semantics AND all other tables
   * POST /table-semantics/generate-embedding
   */
  @Post('generate-embedding')
  async generateAllEmbeddings(): Promise<{
    success: boolean;
    tableSemantics: {
      tableName: string;
      recordsProcessed: number;
      embeddingGenerated: boolean;
      embeddingDimension: number;
    };
    tables: Array<{
      tableName: string;
      recordsProcessed: number;
      embeddingGenerated: boolean;
      embeddingDimension: number;
    }>;
    timestamp: string;
  }> {
    return this.tableSemanticsService.generateAllEmbeddings();
  }

  /**
   * Get all table semantics with embedding status
   * GET /table-semantics/all
   */
  @Get('all')
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
    return this.tableSemanticsService.getAllTableSemantics();
  }
}
