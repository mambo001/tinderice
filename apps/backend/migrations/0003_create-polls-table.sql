-- Migration number: 0003 	 2026-03-24T00:00:00.000Z
CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL,
    title TEXT NOT NULL,
    winnerDishId TEXT,
    startedAt INTEGER NOT NULL,
    endedAt INTEGER,
    isActive INTEGER NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_polls_id ON polls(id);

CREATE TABLE IF NOT EXISTS poll_participants (
    pollId TEXT NOT NULL,
    userId TEXT NOT NULL,
    PRIMARY KEY (pollId, userId),
    FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id)
);
