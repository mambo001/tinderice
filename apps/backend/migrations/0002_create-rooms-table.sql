-- Migration number: 0002 	 2026-03-23T12:15:26.156Z
CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    ownerId TEXT NOT NULL,
    name TEXT NOT NULL,
    createdAt INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_id ON rooms(id);

CREATE TABLE IF NOT EXISTS room_members (
    roomId TEXT NOT NULL,
    userId TEXT NOT NULL,
    PRIMARY KEY (roomId, userId),
    FOREIGN KEY (roomId) REFERENCES rooms(id),
    FOREIGN KEY (userId) REFERENCES users(id)
);