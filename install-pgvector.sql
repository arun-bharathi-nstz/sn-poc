-- ============================================
-- PostgreSQL pgvector Installation Script
-- ============================================
-- Run this in pgAdmin as a superuser/admin

-- Step 1: Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Step 3: Test vector type
SELECT '[1, 2, 3]'::vector AS test_vector;

-- Step 4: Verify embed column can store vectors
-- This should work if your table_semantics table exists
-- SELECT id, name, embed FROM table_semantics LIMIT 1;
