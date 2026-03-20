import { Schema } from "effect";

export class CreateUserDto extends Schema.Class<CreateUserDto>("CreateUserDto")(
  {
    clientID: Schema.String,
    name: Schema.String,
    email: Schema.NullOr(Schema.String),
  },
) {}
