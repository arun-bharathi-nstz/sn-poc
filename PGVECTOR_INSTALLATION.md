# PostgreSQL pgvector Installation Guide

## Status: pgvector NOT INSTALLED ❌

Your database doesn't have pgvector extension installed yet.

## Installation Steps:

### Option 1: Install via pgAdmin (Recommended)

1. **Open pgAdmin**
2. **Connect to your database** (poc)
3. **Open Query Tool**
4. **Copy and paste this command:**

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

5. **Click Execute**
6. **Verify installation by running:**

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

You should see the vector extension listed in the results.

### Option 2: Install via PostgreSQL Client

If you have PostgreSQL CLI installed on your machine:

```bash
psql -h sn-pheonix-poc-db.czooaumuoou9.us-east-2.rds.amazonaws.com -U postgres -d poc -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Replace the password when prompted.

### Option 3: For AWS RDS (Your Setup)

Since you're using AWS RDS PostgreSQL, you may need to:

1. **Check RDS parameter group** - Make sure shared_preload_libraries includes `vector`
2. **Enable pgvector in RDS** - Some RDS instances require enabling via parameter groups

**For RDS, the simplest approach:**

1. Go to AWS Console → RDS → Databases
2. Select your database instance
3. Go to Parameter Groups
4. Create/modify parameter group to add `vector` to `shared_preload_libraries`
5. Reboot the database instance
6. Then run the CREATE EXTENSION command

### Step 4: Verify Installation

After installation, verify with:

```sql
-- Check extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check vector type exists
SELECT typname FROM pg_type WHERE typname = 'vector';

-- Test vector functionality
SELECT '[1, 2, 3]'::vector;

-- Check table_semantics embed column
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'table_semantics' AND column_name = 'embed';
```

All results should show successful vector installation.

## Next Steps:

1. ✅ Install pgvector extension
2. ✅ Verify installation
3. ✅ Run `/table-semantics/generate-all-embeddings` endpoint to populate embeddings
4. ✅ Test SN Agent query endpoint

## Troubleshooting:

**If you get "could not open extension control file" error:**
- pgvector package is not installed on the server
- Contact AWS support to install pgvector for your RDS instance

**If you get "permission denied" error:**
- You need to run the command as a superuser with appropriate privileges
