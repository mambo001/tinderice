-- Migration number: 0006    2026-03-25T00:00:00.000Z
ALTER TABLE polls ADD COLUMN deadlineAt INTEGER;

UPDATE polls
SET deadlineAt = startedAt + (5 * 60 * 1000)
WHERE deadlineAt IS NULL;

CREATE TABLE IF NOT EXISTS poll_dishes (
    pollId TEXT NOT NULL,
    dishId TEXT NOT NULL,
    dishName TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (pollId, dishId),
    FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_poll_dishes_position
ON poll_dishes(pollId, position);

CREATE TABLE IF NOT EXISTS poll_responses (
    pollId TEXT NOT NULL,
    dishId TEXT NOT NULL,
    userId TEXT NOT NULL,
    reaction TEXT NOT NULL,
    respondedAt INTEGER NOT NULL,
    PRIMARY KEY (pollId, dishId, userId),
    FOREIGN KEY (pollId) REFERENCES polls(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_poll_responses_poll_user
ON poll_responses(pollId, userId);
