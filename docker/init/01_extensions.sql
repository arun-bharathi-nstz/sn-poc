-- Enable required PostgreSQL extensions for AI-ready order processing system

-- PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- pgvector for AI embeddings and vector similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- TimescaleDB for time-series data
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- pgcrypto for encryption and secure functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security) support
ALTER SYSTEM SET rls.enabled = on;

-- Create custom session variables for RLS
-- These will be used to enforce tenant isolation
-- Note: These are app-level session variables, not PostgreSQL built-in variables

-- Log extensions loaded
SELECT 'Extensions created successfully' as status;
