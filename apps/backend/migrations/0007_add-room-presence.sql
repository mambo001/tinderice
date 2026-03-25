-- Migration number: 0007    2026-03-25T00:00:00.000Z
CREATE TABLE IF NOT EXISTS room_presence (
    roomId TEXT NOT NULL,
    userId TEXT NOT NULL,
    lastSeenAt INTEGER NOT NULL,
    PRIMARY KEY (roomId, userId),
    FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_room_presence_last_seen
ON room_presence(roomId, lastSeenAt DESC);
