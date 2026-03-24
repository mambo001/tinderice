-- Migration number: 0005    2026-03-24T00:00:00.000Z
ALTER TABLE polls ADD COLUMN roomId TEXT;

CREATE INDEX IF NOT EXISTS idx_polls_room_id ON polls(roomId);
