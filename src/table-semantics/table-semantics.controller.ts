import { Controller, Post, Get } from '@nestjs/common';
import { TableSemanticsService } from './table-semantics.service';

@Controller('table-semantics')
export class TableSemanticsController {
  constructor(private readonly tableSemanticsService: TableSemanticsService) { }

  /**
   * Generate embedding for table_semantics table
   * Converts all table semantics records to text and generates embedding
   * POST /table-semantics/generate-embedding
   */
  @Post('generate-embedding')
  async generateTableSemanticsEmbedding(): Promise<{
    success: boolean;
    tableName: string;
    recordsProcessed: number;
    embeddingGenerated: boolean;
    embeddingDimension: number;
    timestamp: string;
  }> {
    // Only returns table_semantics info
    const result = await this.tableSemanticsService.generateTableSemanticsEmbeddings();
    return {
      success: result.success,
      tableName: result.tableSemantics.tableName,
      recordsProcessed: result.tableSemantics.recordsProcessed,
      embeddingGenerated: result.tableSemantics.embeddingGenerated,
      embeddingDimension: result.tableSemantics.embeddingDimension,
      timestamp: result.timestamp,
    };
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
