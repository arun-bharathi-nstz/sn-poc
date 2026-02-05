# Row Level Security (RLS) Implementation

This module implements comprehensive Row Level Security (RLS) for your PostgreSQL database, restricting data access based on user roles.

## User Roles

| Role | Access Level |
|------|--------------|
| `super_admin` | Can access ALL data across all vendors |
| `vendor_admin` | Can access data only for their assigned vendor |
| `vendor_location_admin` | Can access data only for their assigned vendor location |
| `driver` | Can access their own data and assigned orders |
| `customer` | Can access their own data and orders |

## Quick Start

### 1. Run the SQL Migration

Execute the RLS policies SQL file in your PostgreSQL database:

```bash
psql -U your_user -d your_database -f src/rls/rls-policies.sql
```

Or run it through your migration system:

```typescript
// In your migration file
import * as fs from 'fs';
import * as path from 'path';

const rlsSql = fs.readFileSync(
    path.join(__dirname, '../src/rls/rls-policies.sql'),
    'utf8'
);
await queryRunner.query(rlsSql);
```

### 2. Import RLS Module

In your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { RlsModule } from './rls';

@Module({
    imports: [RlsModule],
    // ... other imports
})
export class AppModule {}
```

### 3. Configure Middleware

In your `main.ts` or `app.module.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RlsMiddleware } from './rls';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Apply RLS middleware globally
    app.use(new RlsMiddleware(app.get(RlsService)));
    
    await app.listen(3000);
}
bootstrap();
```

## How RLS Works

### Database Level

The RLS policies use PostgreSQL's `current_setting('app.current_user_id')` function to get the current user's ID from the session. Each table has policies that check:

1. **Is the user a super admin?** → Allow full access
2. **Is the user a vendor admin?** → Check vendor relationship
3. **Is the user a vendor location admin?** → Check vendor location relationship
4. **Is the user a regular user?** → Check ownership/relationship

### Application Level

The `RlsService` provides methods to:

- `setCurrentUser(userId)`: Sets the current user ID in the database session
- `clearCurrentUser()`: Clears the current user ID from the session
- `isSuperAdmin()`: Checks if current user is a super admin
- `isVendorAdmin()`: Checks if current user is a vendor admin
- `getCurrentUserVendorId()`: Gets the current user's vendor ID

## Usage Examples

### Basic Repository Usage

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RlsService } from './rls';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly rlsService: RlsService
    ) {}

    async findAll(): Promise<User[]> {
        // RLS context should already be set by middleware
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
}
```

### Manual RLS Context Management

```typescript
import { RlsService } from './rls';

@Injectable()
export class SomeService {
    constructor(private readonly rlsService: RlsService) {}

    async protectedOperation(userId: string) {
        await this.rlsService.setCurrentUser(userId);
        
        try {
            // All database operations here will be filtered by RLS
            const data = await this.someRepository.find();
            return data;
        } finally {
            await this.rlsService.clearCurrentUser();
        }
    }
}
```

### Using the Decorator

```typescript
import { WithRlsContext } from './rls';

@Injectable()
export class MyService {
    constructor(private readonly userRepository: UserRepository) {}

    @WithRlsContext()
    async getAllUsers() {
        // RLS context is automatically managed
        return this.userRepository.find();
    }
}
```

## Table Policies

### users Table

| Role | Access |
|------|--------|
| super_admin | All users |
| vendor_admin | Users in their vendor |
| vendor_location_admin | Users in their location |
| All users | Their own record |

### vendors Table

| Role | Access |
|------|--------|
| super_admin | All vendors |
| vendor_admin | Their own vendor + vendors with their customers |
| vendor_location_admin | Vendors associated with their location |
| customer | Vendors they are assigned to |

### vendor_locations Table

| Role | Access |
|------|--------|
| super_admin | All locations |
| vendor_admin | Locations of their vendor |
| vendor_location_admin | Their own location |
| All users | Locations of vendors they're associated with |

### orders Table

| Role | Access |
|------|--------|
| super_admin | All orders |
| vendor_admin | Orders for their vendor |
| vendor_location_admin | Orders for their location |
| driver | Orders assigned to them |
| customer | Their own orders |

### drivers Table

| Role | Access |
|------|--------|
| super_admin | All drivers |
| vendor_admin | Drivers for their vendor |
| vendor_location_admin | Drivers for their location |
| driver | Their own driver record |

### customers Table

| Role | Access |
|------|--------|
| super_admin | All customers |
| vendor_admin | Customers for their vendor |
| vendor_location_admin | Customers for their location |
| customer | Their own customer record |

## Testing RLS

### Create a test user and verify access:

```typescript
describe('RLS Policies', () => {
    it('should allow super admin to see all users', async () => {
        // Set super admin context
        await rlsService.setCurrentUser(superAdminUserId);
        
        const users = await userRepository.find();
        expect(users.length).toBeGreaterThan(0);
    });

    it('should restrict vendor admin to their vendor', async () => {
        // Set vendor admin context
        await rlsService.setCurrentUser(vendorAdminUserId);
        
        const users = await userRepository.find();
        // Should only see users from their vendor
        users.forEach(user => {
            expect(user.vendor_id).toBe(vendorAdminVendorId);
        });
    });
});
```

## Important Notes

1. **Middleware Order**: Ensure authentication middleware runs BEFORE the RLS middleware
2. **Always Clear Context**: Always call `clearCurrentUser()` after operations
3. **Transaction Support**: RLS context is session-based and will persist until cleared
4. **Direct SQL**: RLS policies apply to ALL queries, including raw SQL queries
5. **Performance**: RLS adds minimal overhead with proper indexing

## Troubleshooting

### Queries returning no results:
- Check if RLS context is set: `SELECT app_current_user_id();`
- Verify user role: `SELECT app_is_super_admin();`

### Permission denied errors:
- Ensure RLS is enabled on the table
- Check that policies exist for the operation (SELECT, INSERT, UPDATE, DELETE)

### Performance issues:
- Add indexes on `vendor_id`, `vendor_location_id`, `user_id` columns
- Monitor query plans with `EXPLAIN ANALYZE`
