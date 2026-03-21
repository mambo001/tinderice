-- Migration number: 0001 	 2026-03-20T13:32:05.349Z
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  clientId TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);