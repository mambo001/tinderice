import { Effect, Layer, Schema } from "effect";

import { Room } from "@/domain/entities";
import { RoomRepository } from "@/domain/ports";
import { DatabaseError, RoomNotFoundError } from "@/domain/errors";
import { D1DatabaseTag } from "@/shared/config/env";

interface RoomRow {
  id: string;
  ownerId: string;
  name: string;
  members: string;
  createdAt: number;
}

const encodeRoom = Schema.encode(Room);

export const D1RoomRepositoryLive = Layer.effect(
  RoomRepository,
  Effect.gen(function* () {
    const db = yield* D1DatabaseTag;

    const findById = (id: string) =>
      Effect.gen(function* () {
        const row = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT
                  rooms.id,
                  rooms.ownerId,
                  rooms.name,
                  COALESCE(json_group_array(room_members.userId), json('[]')) AS members,
                  rooms.createdAt
                FROM rooms
                LEFT JOIN room_members ON room_members.roomId = rooms.id
                WHERE rooms.id = ?
                GROUP BY rooms.id, rooms.ownerId, rooms.name, rooms.createdAt`,
              )
              .bind(id)
              .first<RoomRow>(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to query room by ID: ${err}`,
            }),
        });
        if (!row) {
          return yield* Effect.fail(
            new RoomNotFoundError({
              message: `Room with ID ${id} not found`,
            }),
          );
        }
        return yield* Schema.decodeUnknown(Room)({
          ...row,
          members: JSON.parse(row.members) as string[],
        });
      });

    const decodeRoomRows = Schema.decodeUnknown(Schema.Array(Room));

    const findByOwnerId = (ownerId: string) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT
                  rooms.id,
                  rooms.ownerId,
                  rooms.name,
                  COALESCE(json_group_array(room_members.userId), json('[]')) AS members,
                  rooms.createdAt
                FROM rooms
                LEFT JOIN room_members ON room_members.roomId = rooms.id
                WHERE rooms.ownerId = ?
                GROUP BY rooms.id, rooms.ownerId, rooms.name, rooms.createdAt
                ORDER BY rooms.createdAt DESC`,
              )
              .bind(ownerId)
              .all<RoomRow>(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to query rooms by owner ID: ${err}`,
            }),
        });

        return yield* decodeRoomRows(
          rows.results.map((row) => ({
            ...row,
            members: JSON.parse(row.members) as string[],
          })),
        );
      });

    const findByMemberId = (memberId: string) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            db
              .prepare(
                `SELECT
                  rooms.id,
                  rooms.ownerId,
                  rooms.name,
                  COALESCE(json_group_array(all_members.userId), json('[]')) AS members,
                  rooms.createdAt
                FROM rooms
                INNER JOIN room_members AS matched_members
                  ON matched_members.roomId = rooms.id
                LEFT JOIN room_members AS all_members
                  ON all_members.roomId = rooms.id
                WHERE matched_members.userId = ?
                GROUP BY rooms.id, rooms.ownerId, rooms.name, rooms.createdAt
                ORDER BY rooms.createdAt DESC`,
              )
              .bind(memberId)
              .all<RoomRow>(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to query rooms by member ID: ${err}`,
            }),
        });

        return yield* decodeRoomRows(
          rows.results.map((row) => ({
            ...row,
            members: JSON.parse(row.members) as string[],
          })),
        );
      });

    const saveRoom = (room: Room) =>
      Effect.gen(function* () {
        const encoded = yield* encodeRoom(room);
        yield* Effect.tryPromise({
          try: async () => {
            await db.batch([
              db
                .prepare(
                  "INSERT INTO rooms (id, ownerId, name, createdAt) VALUES (?, ?, ?, ?)",
                )
                .bind(
                  encoded.id,
                  encoded.ownerId,
                  encoded.name,
                  encoded.createdAt,
                ),
              ...encoded.members.map((userId) =>
                db
                  .prepare(
                    "INSERT INTO room_members (roomId, userId) VALUES (?, ?)",
                  )
                  .bind(encoded.id, userId),
              ),
            ]);
          },
          catch: (err) =>
            new DatabaseError({
              message: `Failed to save room: ${err}`,
            }),
        });
      });

    const deleteRoom = (id: string) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise({
          try: () =>
            db.prepare("DELETE FROM rooms WHERE id = ?").bind(id).run(),
          catch: (err) =>
            new DatabaseError({
              message: `Failed to delete room: ${err}`,
            }),
        });
      });

    return RoomRepository.of({
      findById,
      findByOwnerId,
      findByMemberId,
      save: saveRoom,
      delete: deleteRoom,
    });
  }),
);
