import { Schema } from "effect";

import { UserId } from "../value-objects";

export class User extends Schema.Class<User>("User")({
  id: UserId,
  clientId: Schema.String,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
  createdAt: Schema.DateFromNumber,
  updatedAt: Schema.NullOr(Schema.DateFromNumber),
}) {}
