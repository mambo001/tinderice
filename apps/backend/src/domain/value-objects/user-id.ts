import { Schema } from "effect";

export const UserId = Schema.UUID.pipe(Schema.brand("UserId"));

export type UserId = typeof UserId.Type;

export const makeUserId = Schema.decodeUnknownSync(UserId);
