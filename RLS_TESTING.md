# Row Level Security (RLS) Testing Guide

## Overview

This document explains how Row Level Security (RLS) is implemented on the `orders` table and how to test it.

## RLS Policies

The following RLS policies are implemented on the `orders` table:

### 1. Super Admin Policy
- **Role**: `super_admin`
- **Access**: Can view ALL orders in the system
- **Use Case**: System administrators who need full visibility

### 2. Vendor Admin Policy
- **Role**: `vendor_admin`
- **Access**: Can view only orders belonging to their vendor
- **Match Criteria**: `orders.vendor_id` matches the vendor associated with the user

### 3. Customer Policy
- **Role**: `customer`
- **Access**: Can view only their own orders
- **Match Criteria**: `orders.customer_id` matches the customer linked to the user

### 4. Driver Policy
- **Role**: `driver`
- **Access**: Can view orders assigned to them
- **Match Criteria**: `orders.driver_id` matches the driver linked to the user

### 5. Vendor Location Admin Policy
- **Role**: `vendor_location_admin`
- **Access**: Can view orders from their specific vendor location
- **Match Criteria**: `orders.vendor_location_id` matches the user's vendor_location_id

## API Endpoints

### Setup RLS (Run Once)
```bash
POST /orders/setup-rls
```
This creates all the RLS policies on the orders table.

### Check RLS Status
```bash
GET /orders/rls-status
```
Returns whether RLS is enabled and lists all active policies.

### Test RLS with User ID
```bash
GET /orders/rls-test?userId=<user-uuid>
```
Tests RLS by setting the user context and querying orders. Returns:
- User details (role, email)
- Orders visible to this user
- Total orders in database
- RLS working status

### Test RLS for All Users
```bash
GET /orders/rls-test-all
```
Tests RLS for all users in the system and returns comparison results.

### Get All Users (for testing)
```bash
GET /orders/users
```

### Create Test Order
```bash
POST /orders/create-test
Content-Type: application/json

{
  "customerId": "<customer-uuid>",
  "vendorId": "<vendor-uuid>",
  "totalAmount": 100
}
```

## Testing Workflow

1. **Setup**: First, call `POST /orders/setup-rls` to create the RLS policies

2. **Verify Setup**: Call `GET /orders/rls-status` to confirm RLS is enabled

3. **Get Users**: Call `GET /orders/users` to get a list of user IDs with different roles

4. **Test Individual Users**: Call `GET /orders/rls-test?userId=<uuid>` for each user

5. **Compare Results**: Call `GET /orders/rls-test-all` to see a summary of what each user can see

## Database Schema Relationships

```
users
  ├── vendors (via user_id) -> for vendor_admin
  ├── customers (via user_id) -> for customer
  ├── drivers (via user_id) -> for driver
  └── vendor_location_id -> for vendor_location_admin

orders
  ├── vendor_id -> vendors.id
  ├── customer_id -> customers.id
  ├── driver_id -> drivers.id
  └── vendor_location_id -> vendor_locations.id
```

## How RLS Works

1. When a query is made, PostgreSQL checks `current_setting('app.current_user_id')` 
2. The session variable is set before each query: `SET app.current_user_id = '<uuid>'`
3. Each policy checks if the current user should have access to each row
4. Only rows that pass at least one policy check are returned

## Session Variable

The RLS policies use `current_setting('app.current_user_id', true)::uuid` to get the current user's ID. This must be set before querying the orders table.

Example:
```sql
SET app.current_user_id = 'user-uuid-here';
SELECT * FROM orders;  -- Only returns orders the user can access
```
