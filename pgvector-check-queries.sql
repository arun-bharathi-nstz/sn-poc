-- ============================================
-- PostgreSQL pgvector Extension Check Queries
-- ============================================
-- Run these queries in pgAdmin to verify pgvector installation

-- 1. Check if pgvector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 2. List all installed extensions
SELECT * FROM pg_extension;

-- 3. Check pgvector version (if installed)
SELECT extversion FROM pg_extension WHERE extname = 'vector';

-- 4. Check if vector type exists
SELECT typname FROM pg_type WHERE typname = 'vector';

-- 5. Check the schema of pgvector
SELECT n.nspname as schema, p.proname as function_name, pg_get_functiondef(p.oid) as function_def
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.proname LIKE '%vector%'
LIMIT 10;

-- 6. Get all available pgvector operators
SELECT o.oprname, t1.typname as left_type, t2.typname as right_type
FROM pg_operator o
LEFT JOIN pg_type t1 ON o.oprleft = t1.oid
LEFT JOIN pg_type t2 ON o.oprright = t2.oid
WHERE o.oprname IN ('<->', '<->', '<=>', '<@', '@>')
ORDER BY o.oprname;

-- 7. Check if table_semantics table has embed column with vector type
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'table_semantics' AND column_name = 'embed';

-- 8. Verify pgvector index support
SELECT * FROM pg_am WHERE amname IN ('ivfflat', 'hnsw');

-- 9. Quick test - try to cast a vector (if pgvector is installed, this will work)
-- Uncomment to test (will error if pgvector not installed)
-- SELECT '[1, 2, 3]'::vector AS test_vector;

-- 10. Create pgvector extension if not exists (ADMIN ONLY)
-- Uncomment and run if you have admin privileges and pgvector is not installed
-- CREATE EXTENSION IF NOT EXISTS vector;
