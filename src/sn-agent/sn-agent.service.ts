import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { TableSemantics } from '../entities/table-semantics.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SnAgentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TableSemantics)
    private readonly tableSemanticsRepository: Repository<TableSemantics>,
    private readonly aiService: AiService,
  ) {}

  /**
   * Process a query for a user
   * @param userId The user ID
   * @param query The user's query
   * @returns User details and query response
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
    response: string;
    timestamp: string;
  }> {
    // Fetch user details
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Convert query to embedding
    const queryEmbedding = await this.aiService.textToEmbedding(query);

    // Search for most similar table semantics
    const matchedTables = await this.findMostSimilarTables(
      queryEmbedding.embedding,
      2, // Get top 2 matches
    );

    // Get AI response
    const aiResponse = await this.aiService.askAi(query);

    return {
      userId,
      user,
      query,
      queryEmbedding: queryEmbedding.embedding,
      matchedTables,
      response: aiResponse.response,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   * @param vector1 First embedding vector
   * @param vector2 Second embedding vector
   * @returns Cosine similarity score (0-1)
   */
  private cosineSimilarity(vector1: number[], vector2: number[]): number {
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
   * Find most similar tables based on embedding similarity
   * Fetches all table semantics and calculates similarity in JavaScript
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
    // Fetch all table semantics records
    const allTables = await this.tableSemanticsRepository.find();

    // Filter tables with embeddings and calculate similarity
    const tablesWithSimilarity = allTables
      .map((table) => {
        // Skip if no embedding exists
        if (!table.embed) {
          return null;
        }

        // Parse embed if it's a string (JSON format)
        let embedding: number[];
        if (typeof table.embed === 'string') {
          try {
            embedding = JSON.parse(table.embed);
            if (!Array.isArray(embedding) || embedding.length === 0) {
              return null;
            }
          } catch {
            console.warn(
              `Failed to parse embedding for table ${table.name}`,
            );
            return null;
          }
        } else if (Array.isArray(table.embed)) {
          embedding = table.embed as unknown as number[];
          if (embedding.length === 0) {
            return null;
          }
        } else {
          return null;
        }

        // Calculate similarity
        const similarity = this.cosineSimilarity(queryEmbedding, embedding);

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

    // Sort by similarity in descending order and return top results
    return tablesWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

