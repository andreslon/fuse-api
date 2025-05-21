-- Initialize database schema for fuse_db
-- Azure PostgreSQL database

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum type for transaction types
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    email VARCHAR(100),
    created_from_transaction BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for users table
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    average_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_value NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_symbol UNIQUE (user_id, symbol)
);

-- Create indexes for portfolios table
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_symbol ON portfolios(symbol);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    total_value NUMERIC(10, 2) NOT NULL,
    type transaction_type NOT NULL DEFAULT 'BUY',
    confirmation_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);

-- Add update timestamps trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
CREATE TRIGGER users_update_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add trigger to portfolios table
CREATE TRIGGER portfolios_update_trigger
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add trigger to transactions table
CREATE TRIGGER transactions_update_trigger
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add initial data for testing (optional)
INSERT INTO users (user_id, name, email, created_from_transaction)
VALUES 
    ('user1', 'John Doe', 'john@example.com', false),
    ('user2', 'Jane Smith', 'jane@example.com', false)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO portfolios (user_id, symbol, quantity, average_price, total_value)
VALUES 
    ('user1', 'AAPL', 10, 180.50, 1805.00),
    ('user1', 'MSFT', 5, 320.75, 1603.75),
    ('user2', 'TSLA', 3, 240.30, 720.90)
ON CONFLICT (user_id, symbol) DO NOTHING; 