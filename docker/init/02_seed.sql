-- Seed mock data for local development
-- Safe to re-run: uses ON CONFLICT DO NOTHING where possible

-- Users
INSERT INTO users (id, email, first_name, last_name, phone, role, is_active, created_at, updated_at)
VALUES
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a01', 'admin@supplynow.test', 'Ava', 'Admin', '555-0101', 'super_admin', true, NOW(), NOW()),
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a02', 'vendor1@supplynow.test', 'Victor', 'Vendor', '555-0102', 'vendor_admin', true, NOW(), NOW()),
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a03', 'vendor2@supplynow.test', 'Vera', 'Vendor', '555-0103', 'vendor_admin', true, NOW(), NOW()),
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a04', 'locadmin@supplynow.test', 'Liam', 'Location', '555-0104', 'vendor_location_admin', true, NOW(), NOW()),
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a05', 'driver1@supplynow.test', 'Dina', 'Driver', '555-0105', 'driver', true, NOW(), NOW()),
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a06', 'driver2@supplynow.test', 'Diego', 'Driver', '555-0106', 'driver', true, NOW(), NOW()),
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a07', 'customer1@supplynow.test', 'Casey', 'Customer', '555-0107', 'customer', true, NOW(), NOW()),
  ('0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a08', 'customer2@supplynow.test', 'Carmen', 'Customer', '555-0108', 'customer', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Vendors
INSERT INTO vendors (id, name, email, phone, "isActive", "createdAt", "updatedAt", user_id)
VALUES
  ('1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01', 'Fresh Fields Produce', 'freshfields@supplynow.test', '555-0201', true, NOW(), NOW(), '0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a02'),
  ('1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02', 'Harbor Seafood Co.', 'harborsea@supplynow.test', '555-0202', true, NOW(), NOW(), '0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a03'),
  ('1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03', 'Sunrise Bakery', 'sunrisebake@supplynow.test', '555-0203', true, NOW(), NOW(), NULL)
ON CONFLICT (email) DO NOTHING;

-- Vendor Locations
INSERT INTO vendor_locations (
  id, name, address, city, state, zip, latitude, longitude, phone, is_active, created_at, updated_at, "vendorId"
)
VALUES
  ('2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c01', 'Fresh Fields - Downtown', '101 Market St', 'San Francisco', 'CA', '94105', 37.7892100, -122.3969000, '555-0301', true, NOW(), NOW(), '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01'),
  ('2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c02', 'Fresh Fields - Mission', '220 Valencia St', 'San Francisco', 'CA', '94103', 37.7688200, -122.4220000, '555-0302', true, NOW(), NOW(), '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01'),
  ('2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c03', 'Harbor Seafood - Pier 39', 'Pier 39', 'San Francisco', 'CA', '94133', 37.8086700, -122.4098200, '555-0303', true, NOW(), NOW(), '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02'),
  ('2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c04', 'Harbor Seafood - Oakland', '55 Embarcadero W', 'Oakland', 'CA', '94607', 37.7955000, -122.2764000, '555-0304', true, NOW(), NOW(), '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02'),
  ('2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c05', 'Sunrise Bakery - SoMa', '700 Folsom St', 'San Francisco', 'CA', '94107', 37.7823300, -122.3971800, '555-0305', true, NOW(), NOW(), '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03'),
  ('2b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0c06', 'Sunrise Bakery - Daly City', '90 Mission St', 'Daly City', 'CA', '94014', 37.7057700, -122.4700000, '555-0306', true, NOW(), NOW(), '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03')
ON CONFLICT (id) DO NOTHING;

-- Drivers
INSERT INTO drivers (
  id, license_number, license_expiry_date, vehicle_number, vehicle_type, is_available, is_active, created_at, updated_at, user_id
)
VALUES
  ('3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d01', 'D-CA-394020', '2027-12-31', 'CA-DRV-101', 'van', true, true, NOW(), NOW(), '0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a05'),
  ('3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d02', 'D-CA-482910', '2026-08-15', 'CA-DRV-102', 'truck', false, true, NOW(), NOW(), '0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a06'),
  ('3b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0d03', 'D-CA-553210', '2028-05-20', 'CA-DRV-103', 'car', true, true, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Customers
INSERT INTO customers (id, name, phone, is_active, created_at, updated_at, user_id)
VALUES
  ('4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01', 'Blue Bottle Cafe', '555-0401', true, NOW(), NOW(), '0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a07'),
  ('4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02', 'Mission Bistro', '555-0402', true, NOW(), NOW(), '0b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0a08'),
  ('4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e03', 'North Beach Deli', '555-0403', true, NOW(), NOW(), NULL),
  ('4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e04', 'Golden Gate Hotel', '555-0404', true, NOW(), NOW(), NULL)
ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO orders (
  id, order_number, customer_id, vendor_id, status, total_amount, "createdAt", "updatedAt"
)
VALUES
  ('5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f01', 'SN-100001', '4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01', '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01', 'pending', 124.50, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f02', 'SN-100002', '4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02', '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02', 'confirmed', 342.10, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f03', 'SN-100003', '4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e03', '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03', 'shipped', 89.99, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f04', 'SN-100004', '4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e04', '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b01', 'delivered', 560.00, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
  ('5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f05', 'SN-100005', '4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e01', '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b02', 'cancelled', 210.75, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),
  ('5b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0f06', 'SN-100006', '4b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0e02', '1b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a0b03', 'pending', 47.25, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
ON CONFLICT (order_number) DO NOTHING;

-- Table semantics
INSERT INTO table_semantics (id, name, type, description, columns, embed, created_at, updated_at)
VALUES
  ('6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a1001', 'users', 'table', 'Application users with roles', 'id,email,first_name,last_name,role,is_active,created_at,updated_at', '[0.12,0.34,0.56]', NOW(), NOW()),
  ('6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a1002', 'vendors', 'table', 'Suppliers and vendors', 'id,name,email,phone,isActive,createdAt,updatedAt,user_id', '[0.22,0.44,0.66]', NOW(), NOW()),
  ('6b8f4e55-7e0a-4f9e-9c7b-1e9f9c1a1003', 'orders', 'table', 'Customer orders', 'id,order_number,customer_id,vendor_id,status,total_amount,createdAt,updatedAt', '[0.18,0.27,0.39]', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
