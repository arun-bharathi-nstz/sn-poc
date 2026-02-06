-- Fix vendor table column names to match TypeORM entity
-- ALTER TABLE vendors RENAME COLUMN isActive TO is_active;
-- Note: Column already exists as is_active based on migrations

-- Fix vendor_locations to ensure vendor_id exists
-- The vendor_id column should already exist from the latest entity definition

-- Verify the current schema:
SELECT 
  t.table_name,
  array_agg(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('vendors', 'vendor_locations', 'customers', 'drivers', 'users', 'orders')
GROUP BY t.table_name
ORDER BY t.table_name;
