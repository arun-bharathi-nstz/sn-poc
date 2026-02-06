import { Injectable, Logger } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { TableSemantics } from '../entities/table-semantics.entity';
import { AiService } from '../ai/ai.service';
import { SnAgentAiService } from './sn-agent-ai.service';
import { findMostSimilarTablesJavaScript } from './sn-agent.utils';

@Injectable()
export class SnAgentService {
  private readonly logger = new Logger(SnAgentService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TableSemantics)
    private readonly tableSemanticsRepository: Repository<TableSemantics>,
    private readonly aiService: AiService,
    private readonly snAgentAiService: SnAgentAiService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Process a query for a user
   * @param userId The user ID
   * @param query The user's query
   * @returns User details, matched tables, SQL, query results, and AI response
   */
  async query(userId: string, query: string): Promise<{
    userId: string;
    user: User | null;
    query: string;
    queryEmbedding: number[];
    matchedTables: Array<{
      id: string;
      name: string;
      description: string | undefined;
      columns: string[];
      similarity: number;
    }>;
    generatedSql: string;
    queryResults: any[];
    response: string;
    timestamp: string;
  }> {
    // Step 1: Fetch user details
    this.logger.log(`[Query Process] Step 1: Fetching user details`);
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    this.logger.log(
      `[Query Process] Step 1 Complete: User found - ${user ? user.id : 'Not found'}`,
    );

    // Step 2: Convert query to embedding
    this.logger.log(`[Query Process] Step 2: Converting query to embedding`);
    const queryEmbedding = await this.aiService.textToEmbedding(query);
    this.logger.log(
      `[Query Process] Step 2 Complete: Embedding generated with ${queryEmbedding.embedding.length} dimensions`,
    );

    // Step 3: Search for most similar table semantics
    this.logger.log(`[Query Process] Step 3: Finding most similar tables`);
    const matchedTables = await this.findMostSimilarTables(
      queryEmbedding.embedding,
      2, // Get top 2 matches
    );
    this.logger.log(
      `[Query Process] Step 3 Complete: Found ${matchedTables.length} similar tables`,
    );
    matchedTables.forEach((table, index) => {
      this.logger.debug(
        `[Query Process]   Table ${index + 1}: ${table.name} (Similarity: ${(table.similarity * 100).toFixed(2)}%)`,
      );
    });

    // Step 4: Generate SQL query using AI based on matched tables
    this.logger.log(`[Query Process] Step 4: Generating SQL from AI`);
    const generatedSql = await this.snAgentAiService.generateSqlFromQuery(
      query,
      matchedTables,
    );
    this.logger.log(`[Query Process] Step 4 Complete: SQL generated`);

    // Step 5: Validate and execute the generated SQL with RLS
    this.logger.log(`[Query Process] Step 5: Validating and executing SQL with RLS`);
    let queryResults: any[] = [];
    if (this.snAgentAiService.validateSql(generatedSql)) {
      try {
        // Execute SQL with RLS by setting user context and switching to app_user role
        queryResults = await this.executeWithRls(userId, generatedSql);
        this.logger.log(
          `[Query Process] Step 5 Complete: SQL executed with RLS, returned ${queryResults.length} rows`,
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `[Query Process] Step 5 Error: Failed to execute SQL - ${errorMessage}`,
        );
        queryResults = [];
      }
    } else {
      this.logger.warn(`[Query Process] Step 5 Skipped: SQL validation failed`);
    }

    // Step 6: Use AI to answer the query with the fetched data
    this.logger.log(`[Query Process] Step 6: Generating final answer from AI`);
    const aiResponse = await this.snAgentAiService.answerQueryWithData(
      query,
      matchedTables,
      queryResults,
    );
    this.logger.log(`[Query Process] Step 6 Complete: Final answer generated`);

    // Step 7: Return response
    this.logger.log(`[Query Process] All steps completed successfully`);

    return {
      userId,
      user,
      query,
      queryEmbedding: queryEmbedding.embedding,
      matchedTables,
      generatedSql,
      queryResults,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute SQL query with Row Level Security (RLS) applied
   * Sets the user context and switches to app_user role to enforce RLS policies
   * @param userId The user ID for RLS context
   * @param sql The SQL query to execute
   * @returns Query results filtered by RLS policies
   */
  private async executeWithRls(userId: string, sql: string): Promise<any[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Set the current user ID in session for RLS policies
      this.logger.debug(`[RLS Execution] Setting user context: ${userId}`);
      await queryRunner.query(`SET app.current_user_id = '${userId}'`);
      
      // Switch to app_user role to enforce RLS (superusers bypass RLS)
      this.logger.debug(`[RLS Execution] Switching to app_user role`);
      await queryRunner.query(`SET ROLE app_user`);

      this.logger.debug(`[RLS Execution] Executing SQL: ${sql}`);

      // Execute the query with RLS applied
      const results = await queryRunner.query(sql);

      this.logger.debug(`[RLS Execution] Query returned ${results.length} rows after RLS filtering`);

      // Reset role back to original
      await queryRunner.query(`RESET ROLE`);

      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[RLS Execution] Error: ${errorMessage}`);
      
      // Ensure we reset the role even on error
      try {
        await queryRunner.query(`RESET ROLE`);
      } catch {
        // Ignore reset errors
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Test RLS execution with a simple SELECT query
   * Used for debugging to verify RLS is working correctly
   */
  async testRlsExecution(userId: string): Promise<any> {
    const sql = 'SELECT id, order_number, status, total_amount, vendor_id, customer_id FROM orders';
    
    // Also test with embed column to see if that's the issue
    const sqlWithEmbed = 'SELECT id, order_number, customer_id, vendor_id, driver_id, status, total_amount, embed, "createdAt", "updatedAt" FROM orders';
    
    try {
      const results = await this.executeWithRls(userId, sql);
      let resultsWithEmbed: any[] = [];
      let embedError: string | null = null;
      
      try {
        resultsWithEmbed = await this.executeWithRls(userId, sqlWithEmbed);
      } catch (error) {
        embedError = error instanceof Error ? error.message : String(error);
      }
      
      return {
        success: true,
        userId,
        sql,
        resultCount: results.length,
        results: results.slice(0, 3),
        sqlWithEmbed,
        resultCountWithEmbed: resultsWithEmbed.length,
        embedError,
      };
    } catch (error) {
      return {
        success: false,
        userId,
        sql,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Find most similar tables based on embedding similarity using PostgreSQL vector extension
   * Attempts to use pgvector <=> operator for efficient vector similarity search
   * Falls back to JavaScript calculation if pgvector is not available
   * @param queryEmbedding The query embedding vector
   * @param limit Number of results to return
   * @returns Top matching tables with similarity scores
   */
  private async findMostSimilarTables(
    queryEmbedding: number[],
    limit: number = 2,
  ): Promise<
    Array<{
      id: string;
      name: string;
      description: string | undefined;
      columns: string[];
      similarity: number;
    }>
  > {
    try {
      this.logger.debug(`[Table Similarity Search] Attempting pgvector query`);

      // Use PostgreSQL raw query with vector extension
      // The <=> operator is the L2 distance operator in pgvector
      // 1 - distance gives us similarity (0-1 range)
      // Convert embedding array to PostgreSQL vector format: [value1, value2, ...]
      const embeddingString = `[${queryEmbedding.join(',')}]`;
      
      const query = this.tableSemanticsRepository
        .createQueryBuilder('ts')
        .select('ts.id', 'id')
        .addSelect('ts.name', 'name')
        .addSelect('ts.description', 'description')
        .addSelect('ts.columns', 'columns')
        .addSelect(
          `1 - (ts.embed <=> :embedding::vector)`,
          'similarity',
        )
        .where('ts.embed IS NOT NULL')
        .orderBy('ts.embed <=> :embedding::vector', 'ASC')
        .setParameters({
          embedding: embeddingString,
        })
        .limit(limit);

      const results = await query.getRawMany();

      this.logger.log(
        `[Table Similarity Search] pgvector query successful, found ${results.length} tables`,
      );

      return results.map((result) => ({
        id: result.id,
        name: result.name,
        description: result.description,
        columns: result.columns,
        similarity: parseFloat(result.similarity),
      }));
    } catch (error) {
      // Fallback to JavaScript calculation if pgvector is not available
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `[Table Similarity Search] pgvector query failed, falling back to JavaScript: ${errorMessage}`,
      );

      try {
        const allTables = await this.tableSemanticsRepository.find();
        this.logger.debug(
          `[Table Similarity Search] JavaScript fallback: found ${allTables.length} tables`,
        );

        return findMostSimilarTablesJavaScript(allTables, queryEmbedding, limit);
      } catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        this.logger.error(
          `[Table Similarity Search] JavaScript fallback also failed: ${fallbackErrorMessage}`,
        );
        return [];
      }
    }
  }
}
