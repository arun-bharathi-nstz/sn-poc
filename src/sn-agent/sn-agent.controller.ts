import { Controller, Post, Body } from '@nestjs/common';
import { SnAgentService } from './sn-agent.service';
import { User } from '../entities/user.entity';

@Controller('sn-agent')
export class SnAgentController {
  constructor(private readonly snAgentService: SnAgentService) {}

  /**
   * Process a query for a user
   * POST /sn-agent/query
   */
  @Post('query')
  async query(
    @Body() payload: { userId: string; query: string },
  ): Promise<{
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
    return this.snAgentService.query(payload.userId, payload.query);
  }
}

