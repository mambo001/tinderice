-- Migration number: 0004 	 2026-03-24T00:00:01.000Z
PRAGMA defer_foreign_keys = on;

CREATE TABLE polls_new (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL,
    title TEXT NOT NULL,
    winnerDishId TEXT,
    startedAt INTEGER NOT NULL,
    endedAt INTEGER,
    isActive BOOLEAN NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES users(id)
);

INSERT INTO polls_new (
    id,
    ownerId,
    title,
    winnerDishId,
    startedAt,
    endedAt,
    isActive
)
SELECT
    id,
    ownerId,
    title,
    winnerDishId,
    startedAt,
    endedAt,
    CASE WHEN isActive THEN TRUE ELSE FALSE END
FROM polls;

DROP TABLE polls;

ALTER TABLE polls_new RENAME TO polls;

CREATE UNIQUE INDEX IF NOT EXISTS idx_polls_id ON polls(id);
