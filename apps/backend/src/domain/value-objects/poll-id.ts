import { Schema } from "effect";

export const PollId = Schema.UUID.pipe(Schema.brand("PollId"));

export type PollId = typeof PollId.Type;

export const makePollId = Schema.decodeUnknownSync(PollId);
