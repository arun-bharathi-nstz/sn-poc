# Database Schema and Column Name Fixes

## Issues Found and Fixed

### 1. **Vendor Location Entity - vendorId Column**
**Problem:** The `vendor-location.entity.ts` had inconsistent column naming:
- `@JoinColumn({ name: 'vendorId' })` 
- `@Column() vendorId!: string`

**Issue:** PostgreSQL lowercases unquoted identifiers, creating `vendorid` (all lowercase) instead of `vendor_id`

**Fix Applied:**
```typescript
@ManyToOne(() => Vendor, (vendor) => vendor.locations, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'vendor_id' })
vendor!: Vendor;

@Column({ name: 'vendor_id' })
vendor_id!: string;
```

### 2. **Vendor Entity - Column Names**
**Problem:** Vendor table had inconsistent column definitions:
- `isActive` without explicit column name → becomes `isactive` (lowercase)
- `createdAt` without explicit column name → becomes `createdat`
- `updatedAt` without explicit column name → becomes `updatedat`

**Fix Applied:**
```typescript
@Column({ name: 'is_active', default: true })
isActive!: boolean;

@CreateDateColumn({ name: 'created_at' })
createdAt!: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt!: Date;
```

### 3. **Seed Data - vendor_id Column**
**Problem:** `seed.ts` used camelCase `vendorId` when creating vendor locations

**Fix Applied:**
```typescript
// Changed from:
{ vendorId: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01" }

// To:
{ vendor_id: "1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01" }
```

## Correct Column Naming Convention

All tables now follow PostgreSQL snake_case convention:

### Orders Table
- `id` (UUID, PK)
- `order_number` (string)
- `customer_id` (FK)
- `vendor_id` (FK)
- `driver_id` (FK, nullable)
- `vendor_location_id` (FK, nullable)
- `status` (enum)
- `total_amount` (decimal)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Vendors Table
- `id` (UUID, PK)
- `name` (string)
- `email` (string)
- `phone` (string, nullable)
- `is_active` (boolean)
- `user_id` (FK, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Vendor Locations Table
- `id` (UUID, PK)
- `name` (string)
- `address` (string)
- `city` (string, nullable)
- `state` (string, nullable)
- `zip` (string, nullable)
- `latitude` (decimal, nullable)
- `longitude` (decimal, nullable)
- `phone` (string, nullable)
- `is_active` (boolean)
- `vendor_id` (FK)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Customers Table
- `id` (UUID, PK)
- `name` (string, nullable)
- `phone` (string, nullable)
- `is_active` (boolean)
- `user_id` (FK, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Drivers Table
- `id` (UUID, PK)
- `license_number` (string)
- `license_expiry_date` (date, nullable)
- `vehicle_number` (string, nullable)
- `vehicle_type` (string, nullable)
- `is_available` (boolean)
- `is_active` (boolean)
- `user_id` (FK, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Users Table
- `id` (UUID, PK)
- `email` (string)
- `first_name` (string)
- `last_name` (string)
- `phone` (string, nullable)
- `role` (enum: super_admin, vendor_admin, vendor_location_admin, driver, customer)
- `is_active` (boolean)
- `vendor_id` (string, nullable)
- `vendor_location_id` (string, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Table Semantics Updated

The `table_semantics` table has been updated with correct column names for the AI agent to use. All columns are now in snake_case to match the actual PostgreSQL database schema.

This ensures the AI-powered query agent generates correct SQL without column name mismatches.

## Files Modified

1. `src/entities/vendor-location.entity.ts` - Fixed vendor_id column
2. `src/entities/vendor.entity.ts` - Fixed is_active, created_at, updated_at columns
3. `src/seed.ts` - Changed vendorId to vendor_id in seed data
4. Generated `fix-semantics.sql` - Updates table_semantics with correct column names

## Next Steps

1. Run the database migration (TypeORM will handle column renames)
2. Execute `fix-semantics.sql` to update the table_semantics table
3. Restart the application
4. Test queries again - the "vendorid does not exist" error should be resolved
