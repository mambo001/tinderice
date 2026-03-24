import { Schema } from "effect";

export const pollReaction = {
  dislike: "dislike",
  like: "like",
  superLike: "superLike",
  skip: "skip",
} as const;

export const PollReaction = Schema.Literal(...Object.values(pollReaction));
export type PollReaction = typeof PollReaction.Type;
