import { Injectable, NestMiddleware, DynamicModule, Module } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
    EntityTarget,
} from 'typeorm';

/**
 * RLS (Row Level Security) Service
 * 
 * This service manages the RLS context by setting the current user ID
 * in the PostgreSQL session for all database operations.
 * 
 * IMPORTANT: You MUST call setCurrentUser() before any database operations
 * and clearCurrentUser() after operations complete.
 */
@Injectable()
export class RlsService {
    constructor(private readonly dataSource: DataSource) {}

    /**
     * Set the current user context for RLS policies
     * Call this method at the beginning of request processing
     * 
     * @param userId - The UUID of the current authenticated user
     */
    async setCurrentUser(userId: string): Promise<void> {
        if (!userId) {
            throw new Error('User ID is required to set RLS context');
        }

        await this.dataSource.query(
            `SELECT app_set_session_user($1)`,
            [userId]
        );
    }

    /**
     * Clear the current user context
     * Call this method after request processing is complete
     */
    async clearCurrentUser(): Promise<void> {
        await this.dataSource.query(
            `SELECT app_clear_session_user()`
        );
    }

    /**
     * Check if current user is a super admin
     */
    async isSuperAdmin(): Promise<boolean> {
        const result = await this.dataSource.query(
            `SELECT app_is_super_admin()`
        );
        return result[0]?.app_is_super_admin ?? false;
    }

    /**
     * Check if current user is a vendor admin
     */
    async isVendorAdmin(): Promise<boolean> {
        const result = await this.dataSource.query(
            `SELECT app_is_vendor_admin()`
        );
        return result[0]?.app_is_vendor_admin ?? false;
    }

    /**
     * Get the current user's vendor ID
     */
    async getCurrentUserVendorId(): Promise<string | null> {
        const result = await this.dataSource.query(
            `SELECT app_current_user_vendor_id()`
        );
        return result[0]?.app_current_user_vendor_id ?? null;
    }

    /**
     * Get the current user ID from session
     */
    async getCurrentUserId(): Promise<string | null> {
        const result = await this.dataSource.query(
            `SELECT app_current_user_id()`
        );
        return result[0]?.app_current_user_id ?? null;
    }
}

/**
 * Express middleware for automatic RLS context management
 * 
 * Usage:
 * - Add this middleware to your main app module
 * - Ensure authentication middleware runs BEFORE this middleware
 * - The middleware expects req.user.id to contain the authenticated user's ID
 */
@Injectable()
export class RlsMiddleware implements NestMiddleware {
    constructor(private readonly rlsService: RlsService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            // Set RLS context with current user
            // Note: Extend Express Request type to include user property
            const user = (req as any).user;
            if (user?.id) {
                await this.rlsService.setCurrentUser(user.id);
            }

            // Clear RLS context after response is sent
            res.on('finish', async () => {
                await this.rlsService.clearCurrentUser();
            });

            next();
        } catch (error) {
            console.error('Error in RLS middleware:', error);
            next();
        }
    }
}

/**
 * Extended Request interface with user property
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        vendor_id?: string;
        vendor_location_id?: string;
    };
}

/**
 * Decorator for manually controlling RLS context in services
 * 
 * Usage:
 * @Injectable()
 * export class MyService {
 *     constructor(
 *         private readonly rlsService: RlsService,
 *         private readonly userRepository: UserRepository
 *     ) {}
 * 
 *     @WithRlsContext()
 *     async getAllUsers() {
 *         // RLS context is automatically set for this method
 *         return this.userRepository.find();
 *     }
 * }
 */
export function WithRlsContext() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const rlsService = (this as any).rlsService;
            const user = (this as any).user; // Assuming user is attached to the class

            if (rlsService && user?.id) {
                await rlsService.setCurrentUser(user.id);
            }

            try {
                return await originalMethod.apply(this, args);
            } finally {
                if (rlsService) {
                    await rlsService.clearCurrentUser();
                }
            }
        };

        return descriptor;
    };
}

/**
 * Guard for checking RLS permissions
 * 
 * Usage:
 * @Injectable()
 * export class SuperAdminGuard implements CanActivate {
 *     constructor(private readonly rlsService: RlsService) {}
 * 
 *     async canActivate(context: ExecutionContext): Promise<boolean> {
 *         return this.rlsService.isSuperAdmin();
 *     }
 * }
 */

/**
 * RLS Module configuration
 */
@Injectable()
export class RlsModule {
    static forRoot(): DynamicModule {
        return {
            module: RlsModule,
            providers: [RlsService],
            exports: [RlsService],
            global: true,
        };
    }
}

/**
 * Helper function to run operations with RLS context
 * 
 * Usage:
 * const users = await withRlsContext(dataSource, userId, async () => {
 *     return userRepository.find();
 * });
 */
export async function withRlsContext<T>(
    dataSource: DataSource,
    userId: string,
    operation: () => Promise<T>
): Promise<T> {
    const rlsService = new RlsService(dataSource);
    await rlsService.setCurrentUser(userId);
    
    try {
        return await operation();
    } finally {
        await rlsService.clearCurrentUser();
    }
}

/**
 * Query runner wrapper for automatic RLS context management
 */
export class RlsQueryRunner {
    constructor(
        private readonly dataSource: DataSource,
        private readonly userId: string
    ) {}

    async query<T = any>(text: string, params?: any[]): Promise<T> {
        await this.dataSource.query(
            `SELECT app_set_session_user($1)`,
            [this.userId]
        );
        return this.dataSource.query(text, params);
    }

    async repository<T>(repository: any): Promise<T> {
        await this.dataSource.query(
            `SELECT app_set_session_user($1)`,
            [this.userId]
        );
        return repository;
    }

    async close(): Promise<void> {
        await this.dataSource.query(`SELECT app_clear_session_user()`);
    }
}
