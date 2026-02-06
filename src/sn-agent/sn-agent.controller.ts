import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SnAgentService } from './sn-agent.service';
import { User } from '../entities/user.entity';

@Controller('sn-agent')
export class SnAgentController {
  constructor(private readonly snAgentService: SnAgentService) {}

  /**
   * Process a query for a user
   * POST /sn-agent/query
   * Returns only the agent's response message
   */
  @Post('query')
  async query(
    @Body() payload: { userId: string; query: string },
  ): Promise<string> {
    const result = await this.snAgentService.query(payload.userId, payload.query);
    return result.response;
  }

  /**
   * Debug endpoint - returns full internal details
   * POST /sn-agent/query-debug
   * Use this to see the internal processing steps, matched tables, generated SQL, etc.
   */
  @Post('query-debug')
  async queryDebug(
    @Body() payload: { userId: string; query: string },
  ): Promise<any> {
    return this.snAgentService.query(payload.userId, payload.query);
  }

  /**
   * Test RLS execution directly
   * GET /sn-agent/test-rls-direct?userId=xxx
   * Tests the executeWithRls method with a simple SELECT * FROM orders
   */
  @Get('test-rls-direct')
  async testRlsDirect(@Query('userId') userId: string): Promise<any> {
    return this.snAgentService.testRlsExecution(userId);
  }
}
