import { Effect } from "effect"

import { User } from "@/domain/entities"
import { UserId } from "@/domain/entities/user-id.value"
import { UserError } from "@/domain/errors"

export class UserRepository extends Effect.Service<UserRepository>()(
  "UserRepository",
  {
    effect: Effect.gen(function* () {
      return {
        findById: (_id: UserId): Effect.Effect<User | null, UserError> =>
          Effect.die("UserRepository.findById not implemented"),

        save: (_user: User): Effect.Effect<User, UserError> =>
          Effect.die("UserRepository.save not implemented"),

        delete: (_id: UserId): Effect.Effect<void, UserError> =>
          Effect.die("UserRepository.delete not implemented"),
      }
    }),
  }
) {}