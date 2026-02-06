-- Fix table_semantics with correct column names for all tables
-- This ensures the AI agent knows the exact column names in PostgreSQL (snake_case)

DELETE FROM table_semantics;

-- Orders table
INSERT INTO table_semantics (id, name, type, description, columns, created_at, updated_at)
VALUES (
  'orders-semantic',
  'orders',
  'table',
  'Contains all customer orders with details about vendors, customers, drivers and payment information',
  'id,order_number,customer_id,vendor_id,driver_id,vendor_location_id,status,total_amount,created_at,updated_at',
  NOW(),
  NOW()
);

-- Users table
INSERT INTO table_semantics (id, name, type, description, columns, created_at, updated_at)
VALUES (
  'users-semantic',
  'users',
  'table',
  'System users with different roles: super_admin, vendor_admin, vendor_location_admin, driver, customer',
  'id,email,first_name,last_name,phone,role,is_active,vendor_id,vendor_location_id,created_at,updated_at',
  NOW(),
  NOW()
);

-- Vendors table
INSERT INTO table_semantics (id, name, type, description, columns, created_at, updated_at)
VALUES (
  'vendors-semantic',
  'vendors',
  'table',
  'Vendor companies that sell products and services',
  'id,name,email,phone,is_active,user_id,created_at,updated_at',
  NOW(),
  NOW()
);

-- Customers table
INSERT INTO table_semantics (id, name, type, description, columns, created_at, updated_at)
VALUES (
  'customers-semantic',
  'customers',
  'table',
  'Customer accounts for placing orders',
  'id,name,phone,is_active,user_id,created_at,updated_at',
  NOW(),
  NOW()
);

-- Drivers table
INSERT INTO table_semantics (id, name, type, description, columns, created_at, updated_at)
VALUES (
  'drivers-semantic',
  'drivers',
  'table',
  'Delivery drivers for managing and completing orders',
  'id,license_number,license_expiry_date,vehicle_number,vehicle_type,is_available,is_active,user_id,created_at,updated_at',
  NOW(),
  NOW()
);

-- Vendor Locations table
INSERT INTO table_semantics (id, name, type, description, columns, created_at, updated_at)
VALUES (
  'vendor_locations-semantic',
  'vendor_locations',
  'table',
  'Physical locations where vendors operate their business',
  'id,name,address,city,state,zip,latitude,longitude,phone,is_active,vendor_id,created_at,updated_at',
  NOW(),
  NOW()
);

-- Delivered Orders materialized view (if it exists)
INSERT INTO table_semantics (id, name, type, description, columns, created_at, updated_at)
VALUES (
  'delivered_orders-semantic',
  'delivered_orders',
  'materialized_view',
  'View showing completed orders that have been delivered',
  'id,order_number,customer_id,vendor_id,driver_id,status,total_amount,created_at',
  NOW(),
  NOW()
);
