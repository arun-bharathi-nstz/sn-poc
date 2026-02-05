/**
 * RLS (Row Level Security) Module
 * 
 * This module provides comprehensive Row Level Security for your PostgreSQL database.
 * 
 * Files:
 * - rls-policies.sql: PostgreSQL RLS policies and helper functions
 * - rls.service.ts: NestJS service and middleware for RLS context management
 * - rls.module.ts: NestJS module configuration
 * 
 * Quick Start:
 * 1. Run the SQL migration in src/rls/rls-policies.sql
 * 2. Import RlsModule in your app module
 * 3. Use RlsMiddleware in your request pipeline
 * 
 * @see README.md for detailed usage instructions
 */

export { RlsService, RlsMiddleware, AuthenticatedRequest, WithRlsContext, withRlsContext, RlsQueryRunner } from './rls.service';
export { RlsModule } from './rls.module';
