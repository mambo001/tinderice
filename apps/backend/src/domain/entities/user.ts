import { Schema } from "effect";

export class User extends Schema.Class<User>("User")({
  id: Schema.String,
  clientId: Schema.String,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
  createdAt: Schema.DateFromNumber,
  updatedAt: Schema.NullOr(Schema.DateFromNumber),
}) {}
