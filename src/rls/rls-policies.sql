-- ========================================================
-- Row Level Security (RLS) Policies for SupplyNow
-- ========================================================
-- This file contains RLS policies for all tables based on user roles:
-- - SUPER_ADMIN: Can access ALL data
-- - VENDOR_ADMIN: Can access data related to their vendor
-- - VENDOR_LOCATION_ADMIN: Can access data related to their vendor location
-- - DRIVER: Can access their assigned own data and orders
-- - CUSTOMER: Can access their own data and orders
-- ========================================================

-- ========================================================
-- Enable RLS on all tables
-- ========================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- USERS TABLE POLICIES
-- ========================================================

-- Super admin can see all users
CREATE POLICY "super_admin_can_view_all_users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Super admin can update all users
CREATE POLICY "super_admin_can_update_all_users" ON users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Vendor admin can view users in their vendor
CREATE POLICY "vendor_admin_can_view_vendor_users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND users.vendor_id = current_user.vendor_id
        )
    );

-- Vendor location admin can view users in their vendor location
CREATE POLICY "vendor_location_admin_can_view_location_users" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_location_admin'
            AND users.vendor_location_id = current_user.vendor_location_id
        )
    );

-- Users can view their own record
CREATE POLICY "users_can_view_own_record" ON users
    FOR SELECT
    USING (id = current_setting('app.current_user_id', true)::uuid);

-- ========================================================
-- VENDORS TABLE POLICIES
-- ========================================================

-- Super admin can view all vendors
CREATE POLICY "super_admin_can_view_all_vendors" ON vendors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Super admin can update all vendors
CREATE POLICY "super_admin_can_update_all_vendors" ON vendors
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Vendor admin can view their own vendor
CREATE POLICY "vendor_admin_can_view_own_vendor" ON vendors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND vendors.user_id = current_user.id
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND vendors.user_id = current_user.id
        )
    );

-- Vendor admin can view vendors that have customers assigned to their vendor
CREATE POLICY "vendor_admin_can_view_customers_vendors" ON vendors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            JOIN customers ON customers.vendor_id = vendors.id
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND customers.user_id = current_user.id
        )
    );

-- Vendor location admin can view vendors associated with their location
CREATE POLICY "vendor_location_admin_can_view_vendors" ON vendors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            JOIN vendor_locations ON vendor_locations.vendor_id = vendors.id
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_location_admin'
            AND vendor_locations.id = current_user.vendor_location_id
        )
    );

-- Customers can view vendors they are assigned to
CREATE POLICY "customers_can_view_assigned_vendors" ON vendors
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            JOIN customers ON customers.vendor_id = vendors.id
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND customers.user_id = current_user.id
        )
    );

-- ========================================================
-- VENDOR_LOCATIONS TABLE POLICIES
-- ========================================================

-- Super admin can view all vendor locations
CREATE POLICY "super_admin_can_view_all_locations" ON vendor_locations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Super admin can update all vendor locations
CREATE POLICY "super_admin_can_update_all_locations" ON vendor_locations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Vendor admin can view locations of their vendor
CREATE POLICY "vendor_admin_can_view_vendor_locations" ON vendor_locations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND vendor_locations.vendorId = current_user.vendor_id
        )
    );

-- Vendor location admin can view their own location
CREATE POLICY "vendor_location_admin_can_view_own_location" ON vendor_locations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_location_admin'
            AND vendor_locations.id = current_user.vendor_location_id
        )
    );

-- Users can view vendor locations of vendors they are associated with
CREATE POLICY "users_can_view_associated_locations" ON vendor_locations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            JOIN vendors ON vendors.id = vendor_locations.vendorId
            LEFT JOIN customers ON customers.vendor_id = vendors.id
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND (
                vendors.user_id = current_user.id
                OR customers.user_id = current_user.id
            )
        )
    );

-- ========================================================
-- ORDERS TABLE POLICIES
-- ========================================================

-- Super admin can view all orders
CREATE POLICY "super_admin_can_view_all_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Super admin can update all orders
CREATE POLICY "super_admin_can_update_all_orders" ON orders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Vendor admin can view orders for their vendor
CREATE POLICY "vendor_admin_can_view_vendor_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND orders.vendor_id = current_user.vendor_id
        )
    );

-- Vendor location admin can view orders for their location
CREATE POLICY "vendor_location_admin_can_view_location_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_location_admin'
            AND orders.vendor_id = current_user.vendor_id
            AND EXISTS (
                SELECT 1 FROM vendor_locations
                WHERE vendor_locations.vendorId = orders.vendor_id
                AND vendor_locations.id = current_user.vendor_location_id
            )
        )
    );

-- Drivers can view orders assigned to them
CREATE POLICY "drivers_can_view_assigned_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'driver'
            AND EXISTS (
                SELECT 1 FROM drivers
                WHERE drivers.user_id = current_user.id
                AND drivers.id = orders.driver_id
            )
        )
    );

-- Customers can view their own orders
CREATE POLICY "customers_can_view_own_orders" ON orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND orders.customer_id = current_user.id
        )
    );

-- ========================================================
-- DRIVERS TABLE POLICIES
-- ========================================================

-- Super admin can view all drivers
CREATE POLICY "super_admin_can_view_all_drivers" ON drivers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Super admin can update all drivers
CREATE POLICY "super_admin_can_update_all_drivers" ON drivers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Vendor admin can view drivers for their vendor
CREATE POLICY "vendor_admin_can_view_vendor_drivers" ON drivers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND EXISTS (
                SELECT 1 FROM users AS driver_user
                WHERE driver_user.id = drivers.user_id
                AND driver_user.vendor_id = current_user.vendor_id
            )
        )
    );

-- Vendor location admin can view drivers for their location
CREATE POLICY "vendor_location_admin_can_view_location_drivers" ON drivers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_location_admin'
            AND EXISTS (
                SELECT 1 FROM users AS driver_user
                WHERE driver_user.id = drivers.user_id
                AND driver_user.vendor_location_id = current_user.vendor_location_id
            )
        )
    );

-- Drivers can view their own driver record
CREATE POLICY "drivers_can_view_own_record" ON drivers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND drivers.user_id = current_user.id
        )
    );

-- ========================================================
-- CUSTOMERS TABLE POLICIES
-- ========================================================

-- Super admin can view all customers
CREATE POLICY "super_admin_can_view_all_customers" ON customers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Super admin can update all customers
CREATE POLICY "super_admin_can_update_all_customers" ON customers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'super_admin'
        )
    );

-- Vendor admin can view customers for their vendor
CREATE POLICY "vendor_admin_can_view_vendor_customers" ON customers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_admin'
            AND customers.vendor_id = current_user.vendor_id
        )
    );

-- Vendor location admin can view customers for their location
CREATE POLICY "vendor_location_admin_can_view_location_customers" ON customers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND current_user.role = 'vendor_location_admin'
            AND EXISTS (
                SELECT 1 FROM vendor_locations
                WHERE vendor_locations.vendorId = customers.vendor_id
                AND vendor_locations.id = current_user.vendor_location_id
            )
        )
    );

-- Customers can view their own customer record
CREATE POLICY "customers_can_view_own_record" ON customers
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users AS current_user
            WHERE current_user.id = current_setting('app.current_user_id', true)::uuid
            AND customers.user_id = current_user.id
        )
    );

-- ========================================================
-- Utility Functions for RLS
-- ========================================================

-- Function to get current user ID
CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS uuid AS $$
BEGIN
    RETURN current_setting('app.current_user_id', true)::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION app_is_super_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = current_setting('app.current_user_id', true)::uuid
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is vendor admin
CREATE OR REPLACE FUNCTION app_is_vendor_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = current_setting('app.current_user_id', true)::uuid
        AND role = 'vendor_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's vendor ID
CREATE OR REPLACE FUNCTION app_current_user_vendor_id()
RETURNS uuid AS $$
DECLARE
    vendor_id uuid;
BEGIN
    SELECT users.vendor_id INTO vendor_id
    FROM users
    WHERE users.id = current_setting('app.current_user_id', true)::uuid;
    RETURN vendor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================
-- Migration Helper Functions
-- ========================================================

-- Function to set current user context for RLS (to be used in application)
CREATE OR REPLACE FUNCTION app_set_session_user(user_id uuid)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear current user context
CREATE OR REPLACE FUNCTION app_clear_session_user()
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
