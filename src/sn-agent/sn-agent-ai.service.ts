import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

/**
 * SN Agent AI Service
 * Handles AI-powered SQL generation and query answering
 */
@Injectable()
export class SnAgentAiService {
  private readonly logger = new Logger(SnAgentAiService.name);

  constructor(private readonly aiService: AiService) {}

  /**
   * Generate SQL query for matched tables based on user query
   * Uses AI to understand the query and generate appropriate SQL
   * @param userQuery The user's natural language query
   * @param matchedTables Array of matched table semantics
   * @returns Generated SQL query
   */
  async generateSqlFromQuery(
    userQuery: string,
    matchedTables: Array<{
      id: string;
      name: string;
      description?: string;
      columns: string[];
      similarity: number;
    }>,
  ): Promise<string> {
    this.logger.log(`[SQL Generation] Starting SQL generation for query: "${userQuery}"`);
    this.logger.debug(
      `[SQL Generation] Matched tables count: ${matchedTables.length}`,
    );

    // Build context about matched tables
    const tablesContext = matchedTables
      .map(
        (table, index) => {
          // Handle columns - could be array or string
          let columnsStr = '';
          if (Array.isArray(table.columns)) {
            columnsStr = table.columns.join(', ');
          } else if (typeof table.columns === 'string') {
            // If it's a JSON string, parse it
            try {
              const parsed = JSON.parse(table.columns);
              columnsStr = Array.isArray(parsed) ? parsed.join(', ') : String(table.columns);
            } catch {
              columnsStr = String(table.columns);
            }
          } else {
            columnsStr = String(table.columns || 'N/A');
          }

          return (
            `Table ${index + 1}: ${table.name}\n` +
            `Description: ${table.description || 'N/A'}\n` +
            `Columns: ${columnsStr}\n` +
            `Relevance Score: ${(table.similarity * 100).toFixed(2)}%`
          );
        },
      )
      .join('\n\n');

    this.logger.debug(
      `[SQL Generation] Table context:\n${tablesContext}`,
    );

    // Create prompt for SQL generation - STRICT: Only use provided tables and columns
    const sqlGenerationPrompt = `You are a SQL expert. Generate a SQL query to answer the user's question.

IMPORTANT - STRICT RULES:
1. ONLY use the exact table names and column names provided below
2. NEVER make up or guess table names or column names
3. NEVER use tables or columns not listed below
4. NEVER select the 'embed' column (it's for internal use only, use it only for vector similarity searches)
5. If a question cannot be answered with the provided tables, return an empty SELECT instead
6. Return ONLY the SQL query, nothing else - no markdown, no explanations, no comments

User Query: "${userQuery}"

Available Tables (use EXACT names and columns):
${tablesContext}

Generate the SQL query:`;

    this.logger.debug(`[SQL Generation] Calling AI service to generate SQL`);

    // Call AI to generate SQL
    const sqlResponse = await this.aiService.askAi(sqlGenerationPrompt);

    this.logger.debug(`[SQL Generation] Raw AI response: ${sqlResponse.response}`);

    // Extract SQL from response (remove markdown code blocks if present)
    const sqlQuery = this.extractSql(sqlResponse.response);

    this.logger.log(`[SQL Generation] Generated SQL: ${sqlQuery}`);

    return sqlQuery;
  }

  /**
   * Answer user query with provided data using AI
   * Takes the data fetched from database and generates natural language answer
   * Responds like a helpful agent, without technical jargon
   * @param userQuery The original user query
   * @param matchedTables Array of matched table semantics
   * @param queryResults The data returned from the SQL query execution
   * @returns Natural language answer to the user's question
   */
  async answerQueryWithData(
    userQuery: string,
    matchedTables: Array<{
      id: string;
      name: string;
      description?: string;
      columns: string[];
      similarity: number;
    }>,
    queryResults: any[],
  ): Promise<string> {
    this.logger.log(
      `[Query Answer] Starting query answer generation for: "${userQuery}"`,
    );
    this.logger.debug(
      `[Query Answer] Query results count: ${queryResults.length}`,
    );

    // Remove embed column from results before sending to AI (saves tokens and unnecessary data)
    const cleanedResults = queryResults.map((row) => {
      const cleaned = { ...row };
      delete cleaned.embed; // Remove vector embedding column
      return cleaned;
    });

    this.logger.debug(
      `[Query Answer] Removed embed columns, cleaned results: ${cleanedResults.length} rows`,
    );

    // Format the query results for the prompt
    const resultsContext = JSON.stringify(cleanedResults, null, 2);

    this.logger.debug(`[Query Answer] Results data: ${resultsContext}`);

    // Build tables context
    const tablesContext = matchedTables
      .map((table) => {
        // Handle columns that could be array, string, or JSON
        let columnsStr = 'N/A';
        if (Array.isArray(table.columns)) {
          columnsStr = table.columns.join(', ');
        } else if (typeof table.columns === 'string') {
          columnsStr = table.columns;
        } else if (typeof table.columns === 'object') {
          try {
            const parsed = JSON.parse(JSON.stringify(table.columns));
            columnsStr = Array.isArray(parsed) ? parsed.join(', ') : JSON.stringify(parsed);
          } catch {
            columnsStr = String(table.columns);
          }
        }
        return `- ${table.name}: ${table.description || 'N/A'} (Columns: ${columnsStr})`;
      })
      .join('\n');

    this.logger.debug(`[Query Answer] Tables context:\n${tablesContext}`);

    // Create prompt for answering the query - Pure agent response, no technical jargon
    const answerPrompt = `You are a helpful customer service agent. Answer the user's question naturally and conversationally.

Question: "${userQuery}"

Here is the information I found:
${resultsContext}

Instructions:
- Respond as a friendly agent, not as a technical assistant
- DO NOT mention databases, tables, columns, or any technical details
- DO NOT mention user IDs, user roles, or any system information
- Just provide the answer in natural, conversational language
- If no data was found, explain what you would need to help them (but use natural language, not technical terms)
- Be concise and helpful
- Format the response to be easy to read and understand`;

    this.logger.debug(`[Query Answer] Calling AI service to generate answer`);

    // Call AI to generate answer
    const answerResponse = await this.aiService.askAi(answerPrompt);

    this.logger.log(
      `[Query Answer] Final answer generated: ${answerResponse.response.substring(0, 100)}...`,
    );

    return answerResponse.response;
  }

  /**
   * Extract SQL query from AI response
   * Handles responses that might have markdown code blocks or extra text
   * @param response The AI response text
   * @returns Clean SQL query
   */
  private extractSql(response: string): string {
    this.logger.debug(`[SQL Extraction] Starting SQL extraction`);

    // Remove markdown code blocks if present
    let sql = response
      .replace(/```sql\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Remove common SQL comment prefixes
    sql = sql.replace(/^(SELECT|WITH|INSERT|UPDATE|DELETE)/i, (match) =>
      match.toUpperCase(),
    );

    // Fix camelCase column names by quoting them (PostgreSQL requires quotes for mixed case)
    sql = this.quoteCamelCaseColumns(sql);

    this.logger.debug(`[SQL Extraction] Extracted SQL: ${sql}`);

    return sql;
  }


  /**
   * Quote column names for PostgreSQL compatibility
   * Quotes both camelCase columns (createdAt) and snake_case columns (created_at)
   * that contain underscores or match patterns
   * @param sql The SQL query to fix
   * @returns SQL with quoted identifiers
   */
  private quoteCamelCaseColumns(sql: string): string {
    // Known columns that need quoting - both camelCase and snake_case versions
    const columnsToQuote = [
      'createdAt', 'created_at',
      'updatedAt', 'updated_at',
      'vendorLocation', 'vendor_location',
      'vendorId', 'vendor_id',
      'customerId', 'customer_id',
      'driverId', 'driver_id',
      'vendorLocationId', 'vendor_location_id',
      'isActive', 'is_active',
      'isAvailable', 'is_available',
      'firstName', 'first_name',
      'lastName', 'last_name',
      'licenseNumber', 'license_number',
      'licenseExpiryDate', 'license_expiry_date',
      'vehicleNumber', 'vehicle_number',
      'vehicleType', 'vehicle_type',
      'orderNumber', 'order_number',
      'totalAmount', 'total_amount',
      'userId', 'user_id',
    ];
    
    for (const col of columnsToQuote) {
      // Match the column name when not already quoted and as a word boundary
      const regex = new RegExp(`(?<!")\\b${col}\\b(?!")`, 'g');
      sql = sql.replace(regex, `"${col}"`);
    }
    
    return sql;
  }

  /**
   * Validate SQL query for safety
   * Performs basic checks to prevent malicious queries
   * @param sql The SQL query to validate
   * @returns true if query is safe to execute
   */
  validateSql(sql: string): boolean {
    this.logger.log(`[SQL Validation] Validating SQL query: ${sql}`);

    const upperSql = sql.toUpperCase().trim();

    // Only allow SELECT queries for safety
    if (!upperSql.startsWith('SELECT')) {
      this.logger.warn(
        `[SQL Validation] Query rejected: only SELECT queries are allowed`,
      );
      return false;
    }

    // Block dangerous keywords (as standalone words, not part of column names)
    // Using word boundary regex to avoid false positives like "updatedAt" matching "UPDATE"
    const dangerousKeywords = [
      'DROP',
      'DELETE',
      'INSERT',
      'UPDATE',
      'ALTER',
      'CREATE',
      'TRUNCATE',
      'EXEC',
      'EXECUTE',
    ];

    for (const keyword of dangerousKeywords) {
      // Use word boundary regex: matches keyword as standalone word
      // \b matches word boundaries, so "UPDATE" won't match "UPDATEDAT"
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(sql)) {
        this.logger.warn(
          `[SQL Validation] Query rejected: dangerous keyword '${keyword}' detected`,
        );
        return false;
      }
    }

    this.logger.log(`[SQL Validation] SQL query passed validation ✅`);
    return true;
  }
}
