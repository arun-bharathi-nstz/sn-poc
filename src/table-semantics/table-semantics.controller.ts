import { Controller, Post, Get } from '@nestjs/common';
import { TableSemanticsService } from './table-semantics.service';

@Controller('table-semantics')
export class TableSemanticsController {
  constructor(private readonly tableSemanticsService: TableSemanticsService) {}

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
    return this.tableSemanticsService.generateTableSemanticsEmbeddings();
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
