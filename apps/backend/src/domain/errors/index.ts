import { Data } from "effect";

export class UserError extends Data.TaggedError("UserError")<{
  message?: string;
}> {}

export class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  message?: string;
}> {}

export class UserAlreadyExistsError extends Data.TaggedError(
  "UserAlreadyExistsError",
)<{
  message?: string;
}> {}

export class RoomNotFoundError extends Data.TaggedError("RoomNotFoundError")<{
  message?: string;
}> {}

export class PollNotFoundError extends Data.TaggedError("PollNotFoundError")<{
  message?: string;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message?: string;
}> {}