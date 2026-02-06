/**
 * SN Agent Utility Helper Functions
 * Contains helper methods for similarity calculations and embeddings
 */

/**
 * Calculate cosine similarity between two embedding vectors
 * @param vector1 First embedding vector
 * @param vector2 Second embedding vector
 * @returns Cosine similarity score (0-1)
 */
export function cosineSimilarity(vector1: number[], vector2: number[]): number {
  // Handle edge cases
  if (!vector1 || !vector2 || vector1.length === 0 || vector2.length === 0) {
    return 0;
  }

  if (vector1.length !== vector2.length) {
    // If dimensions don't match, return 0 instead of throwing
    console.warn(
      `Vector dimension mismatch: ${vector1.length} vs ${vector2.length}`,
    );
    return 0;
  }

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < vector1.length; i++) {
    dotProduct += vector1[i] * vector2[i];
    magnitude1 += vector1[i] * vector1[i];
    magnitude2 += vector2[i] * vector2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Parse embedding from various formats (string JSON or array)
 * @param embed The embed data to parse
 * @param tableName The table name for logging purposes
 * @returns Parsed embedding vector or null if invalid
 */
export function parseEmbedding(
  embed: any,
  tableName?: string,
): number[] | null {
  if (!embed) {
    return null;
  }

  // If it's a string, parse it as JSON
  if (typeof embed === 'string') {
    try {
      const parsed = JSON.parse(embed);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return null;
      }
      return parsed;
    } catch {
      console.warn(`Failed to parse embedding for table ${tableName}`);
      return null;
    }
  }

  // If it's already an array
  if (Array.isArray(embed)) {
    if (embed.length === 0) {
      return null;
    }
    return embed as unknown as number[];
  }

  return null;
}

/**
 * Calculate similarity between query embedding and table embedding
 * Uses either pgvector distance or fallback to cosine similarity
 * @param queryEmbedding The query embedding vector
 * @param tableEmbedding The table embedding vector
 * @returns Similarity score (0-1)
 */
export function calculateSimilarity(
  queryEmbedding: number[],
  tableEmbedding: number[],
): number {
  return cosineSimilarity(queryEmbedding, tableEmbedding);
}

/**
 * Sort tables by similarity in descending order and get top N
 * @param tables Array of tables with similarity scores
 * @param limit Number of top results to return
 * @returns Top N tables sorted by similarity
 */
export function getTopSimilarTables<T extends { similarity: number }>(
  tables: T[],
  limit: number = 2,
): T[] {
  return tables.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

/**
 * Filter valid embeddings from table records
 * @param table Table record to validate
 * @returns Parsed embedding or null if invalid
 */
export function getValidEmbedding(table: any): number[] | null {
  if (!table || !table.embed) {
    return null;
  }

  return parseEmbedding(table.embed, table.name);
}

/**
 * Find most similar tables using JavaScript cosine similarity
 * This is used as a fallback when PostgreSQL vector extension is not available
 * @param tables Array of table semantics records with embeddings
 * @param queryEmbedding The query embedding vector
 * @param limit Number of results to return
 * @returns Top matching tables with similarity scores
 */
export function findMostSimilarTablesJavaScript<T extends { id: string; name: string; description?: string; columns: string[]; embed?: any }>(
  tables: T[],
  queryEmbedding: number[],
  limit: number = 2,
): Array<{
  id: string;
  name: string;
  description: string | undefined;
  columns: string[];
  similarity: number;
}> {
  // Filter tables with embeddings and calculate similarity
  const tablesWithSimilarity = tables
    .map((table) => {
      // Parse and validate embedding
      const embedding = parseEmbedding(table.embed, table.name);
      if (!embedding) {
        return null;
      }

      // Calculate similarity
      const similarity = cosineSimilarity(queryEmbedding, embedding);

      return {
        id: table.id,
        name: table.name,
        description: table.description,
        columns: table.columns,
        similarity,
      };
    })
    .filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

  // Return top results sorted by similarity
  return getTopSimilarTables(tablesWithSimilarity, limit);
}
