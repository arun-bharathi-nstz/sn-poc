import { Module, Global } from '@nestjs/common';
import { RlsService } from './rls.service';
import { RlsMiddleware } from './rls.service';

/**
 * RLS Module
 * 
 * This module provides Row Level Security (RLS) functionality for the application.
 * 
 * Features:
 * - RlsService: Service for managing RLS context in database operations
 * - RlsMiddleware: Middleware for automatic RLS context management per request
 * 
 * Usage:
 * 
 * 1. Import RLS module in your app module:
 * @Module({
 *   imports: [RlsModule.forRoot()],
 *   ...
 * })
 * export class AppModule {}
 * 
 * 2. Use RlsMiddleware in your main.ts or app module:
 * app.use(new RlsMiddleware(app.get(RlsService)));
 * 
 * 3. Or apply it in your module:
 * @Module({
 *   imports: [RlsModule.forRoot()],
 *   providers: [YourService],
 * })
 * export class YourModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(RlsMiddleware).forRoutes('*');
 *   }
 * }
 */
@Global()
@Module({
    providers: [RlsService],
    exports: [RlsService],
})
export class RlsModule {}
