-- Create data_deletion_requests table for tracking data deletion requests
-- This table logs all user data deletion requests (both user-initiated and Facebook-initiated)

CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,

    -- Foreign key to users table (optional, as user might be deleted)
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_data_deletion_email ON data_deletion_requests(email);
CREATE INDEX IF NOT EXISTS idx_data_deletion_user_id ON data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_status ON data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_deletion_created_at ON data_deletion_requests(created_at);

-- Add comments to columns for documentation
COMMENT ON TABLE data_deletion_requests IS 'Tracks all user data deletion requests from both users and Facebook';
COMMENT ON COLUMN data_deletion_requests.id IS 'Unique identifier for the deletion request (UUID)';
COMMENT ON COLUMN data_deletion_requests.user_id IS 'BuzzIt user ID (may be null if user already deleted)';
COMMENT ON COLUMN data_deletion_requests.email IS 'Email address of the user requesting deletion';
COMMENT ON COLUMN data_deletion_requests.username IS 'Username of the user requesting deletion';
COMMENT ON COLUMN data_deletion_requests.reason IS 'Optional reason provided by the user for deletion';
COMMENT ON COLUMN data_deletion_requests.status IS 'Status of the deletion request (pending, completed, failed)';
COMMENT ON COLUMN data_deletion_requests.source IS 'Source of the deletion request (user, facebook)';
COMMENT ON COLUMN data_deletion_requests.created_at IS 'When the deletion request was created';
COMMENT ON COLUMN data_deletion_requests.processed_at IS 'When the deletion was actually processed';
