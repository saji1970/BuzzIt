# Database Migrations

This directory contains SQL migration scripts for the BuzzIt database.

## Running the Data Deletion Requests Table Migration

To create the `data_deletion_requests` table, run the following SQL script against your PostgreSQL database:

### Option 1: Using psql (PostgreSQL command-line tool)

```bash
psql $DATABASE_URL -f server/db/migrations/create_data_deletion_requests_table.sql
```

### Option 2: Using Railway CLI

```bash
# Connect to your Railway PostgreSQL instance
railway connect

# Then run:
\i server/db/migrations/create_data_deletion_requests_table.sql
```

### Option 3: Using a PostgreSQL GUI (pgAdmin, TablePlus, etc.)

1. Connect to your database
2. Open the SQL query editor
3. Copy and paste the contents of `create_data_deletion_requests_table.sql`
4. Execute the query

### Option 4: Direct SQL Execution

If you're already connected to your database in Railway or another platform:

```sql
-- Copy and paste the entire contents of create_data_deletion_requests_table.sql
-- and execute it
```

## Migration Script Details

The migration creates:
- `data_deletion_requests` table with the following columns:
  - `id` - Unique identifier (UUID)
  - `user_id` - Reference to the user (nullable if user already deleted)
  - `email` - User's email address
  - `username` - User's username
  - `reason` - Optional reason for deletion
  - `status` - Status of the request (pending, completed, failed)
  - `source` - Where the request came from (user, facebook)
  - `created_at` - When the request was created
  - `processed_at` - When it was processed

- Indexes for better performance on:
  - email
  - user_id
  - status
  - created_at

## Verification

After running the migration, verify it was successful:

```sql
-- Check if table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'data_deletion_requests';

-- Check table structure
\d data_deletion_requests

-- Or using SQL:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'data_deletion_requests'
ORDER BY ordinal_position;
```

## Note

This migration is **optional** but recommended. The data deletion endpoints will work without this table, but the deletion requests won't be logged in the database. The endpoints gracefully handle the case where this table doesn't exist.

If you don't run this migration:
- Data deletions will still work
- But deletion requests won't be tracked in the database
- They will only be logged to the server console
