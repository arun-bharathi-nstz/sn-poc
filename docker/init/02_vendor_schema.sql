-- Vendor/customer/order schema with RLS and a materialized view

BEGIN;

-- Base tables
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  industry text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customers_vendor_id_idx ON customers(vendor_id);
CREATE INDEX IF NOT EXISTS orders_vendor_id_idx ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders(customer_id);

-- RLS setup
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners as well (safer for app role)
ALTER TABLE vendors FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- Policies: limit all access to the current vendor_id session setting
DROP POLICY IF EXISTS vendors_isolation ON vendors;
CREATE POLICY vendors_isolation ON vendors
  USING (id = current_setting('app.vendor_id', true)::uuid)
  WITH CHECK (id = current_setting('app.vendor_id', true)::uuid);

DROP POLICY IF EXISTS customers_isolation ON customers;
CREATE POLICY customers_isolation ON customers
  USING (vendor_id = current_setting('app.vendor_id', true)::uuid)
  WITH CHECK (vendor_id = current_setting('app.vendor_id', true)::uuid);

DROP POLICY IF EXISTS orders_isolation ON orders;
CREATE POLICY orders_isolation ON orders
  USING (vendor_id = current_setting('app.vendor_id', true)::uuid)
  WITH CHECK (vendor_id = current_setting('app.vendor_id', true)::uuid);

-- Materialized view for vendor order summary
DROP MATERIALIZED VIEW IF EXISTS vendor_order_summary;
CREATE MATERIALIZED VIEW vendor_order_summary AS
SELECT
  vendor_id,
  COUNT(*)::bigint AS total_orders,
  COALESCE(SUM(total_amount), 0)::numeric(12,2) AS total_revenue,
  MAX(created_at) AS last_order_at
FROM orders
GROUP BY vendor_id;

CREATE UNIQUE INDEX IF NOT EXISTS vendor_order_summary_vendor_id_idx
  ON vendor_order_summary(vendor_id);

ALTER TABLE vendor_order_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_order_summary FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendor_order_summary_isolation ON vendor_order_summary;
CREATE POLICY vendor_order_summary_isolation ON vendor_order_summary
  USING (vendor_id = current_setting('app.vendor_id', true)::uuid)
  WITH CHECK (vendor_id = current_setting('app.vendor_id', true)::uuid);

-- Mock data (two vendors, isolated customers/orders)
INSERT INTO vendors (id, name, industry)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Acme Supplies', 'Industrial'),
  ('22222222-2222-2222-2222-222222222222', 'Bright Foods', 'Food & Beverage')
ON CONFLICT DO NOTHING;

INSERT INTO customers (id, vendor_id, name, email)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'Riley Chen', 'riley.chen@acme.example'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '11111111-1111-1111-1111-111111111111', 'Sam Ortega', 'sam.ortega@acme.example'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'Jordan Blake', 'jordan.blake@bright.example'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'Casey Park', 'casey.park@bright.example')
ON CONFLICT DO NOTHING;

INSERT INTO orders (id, vendor_id, customer_id, total_amount, status, created_at)
VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 1250.00, 'shipped', now() - interval '7 days'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 420.50, 'processing', now() - interval '2 days'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 89.99, 'delivered', now() - interval '10 days'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 310.00, 'processing', now() - interval '1 days')
ON CONFLICT DO NOTHING;

-- Refresh materialized view to include mock data
REFRESH MATERIALIZED VIEW vendor_order_summary;

COMMIT;
