import { describe, expect, it } from "vitest";
import { Effect } from "effect";

import { findPollByPollId } from "../src/application/queries";
import { PollNotFoundError } from "../src/domain/errors";
import { Poll } from "../src/domain/entities";
import { PollRepository } from "../src/domain/ports";
import {
  makeDishId,
  makePollId,
  makeUserId,
} from "../src/domain/value-objects";

const makePoll = () =>
  Poll.make({
    id: makePollId("11111111-1111-4111-8111-111111111111"),
    ownerId: makeUserId("22222222-2222-4222-8222-222222222222"),
    title: "Weeknight dinner",
    participants: [
      makeUserId("22222222-2222-4222-8222-222222222222"),
      makeUserId("33333333-3333-4333-8333-333333333333"),
    ],
    winnerDishId: makeDishId("44444444-4444-4444-8444-444444444444"),
    startedAt: new Date("2026-03-24T12:00:00.000Z"),
    endedAt: null,
    isActive: true,
  });

describe("findPollByPollId", () => {
  it("returns the poll from the repository", async () => {
    const poll = makePoll();

    const program = findPollByPollId(poll.id).pipe(
      Effect.provideService(PollRepository, {
        findById: () => Effect.succeed(poll),
        save: () => Effect.void,
        delete: () => Effect.void,
      }),
    ) as Effect.Effect<Poll, PollNotFoundError, never>;

    await expect(Effect.runPromise(program)).resolves.toEqual(poll);
  });

  it("propagates repository not found errors", async () => {
    const pollId = makePollId("55555555-5555-4555-8555-555555555555");

    const program = findPollByPollId(pollId).pipe(
      Effect.provideService(PollRepository, {
        findById: () =>
          Effect.fail(
            new PollNotFoundError({
              message: `Poll with ID ${pollId} not found`,
            }),
          ),
        save: () => Effect.void,
        delete: () => Effect.void,
      }),
    ) as Effect.Effect<never, PollNotFoundError, never>;

    await expect(Effect.runPromiseExit(program)).resolves.toMatchObject({
      _tag: "Failure",
      cause: {
        _tag: "Fail",
        error: {
          _tag: "PollNotFoundError",
          message: `Poll with ID ${pollId} not found`,
        },
      },
    });
  });
});
