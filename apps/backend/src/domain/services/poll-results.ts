import { Poll, PollDish, PollResponse } from "@/domain/entities";
import { pollReaction } from "@/domain/value-objects";

export interface PollResultItem {
  dishId: string;
  dishName: string;
  imageUrl: string;
  position: number;
  score: number;
  positiveCount: number;
  superLikes: number;
  dislikes: number;
  skips: number;
  responsesCount: number;
}

export function rankPollResults(
  poll: Poll,
  dishes: readonly PollDish[],
  responses: readonly PollResponse[],
): PollResultItem[] {
  const scoreByReaction: Record<string, number> = {
    [pollReaction.dislike]: -1,
    [pollReaction.like]: 1,
    [pollReaction.superLike]: 3,
    [pollReaction.skip]: 0,
  };

  return dishes
    .map((dish) => {
      const dishResponses = responses.filter((response) => response.dishId === dish.dishId);
      const positiveUsers = new Set(
        dishResponses
          .filter(
            (response) =>
              response.reaction === pollReaction.like ||
              response.reaction === pollReaction.superLike,
          )
          .map((response) => response.userId),
      );
      const superLikes = dishResponses.filter(
        (response) => response.reaction === pollReaction.superLike,
      ).length;
      const dislikes = dishResponses.filter(
        (response) => response.reaction === pollReaction.dislike,
      ).length;
      const skips = dishResponses.filter(
        (response) => response.reaction === pollReaction.skip,
      ).length;
      const score = dishResponses.reduce(
        (total, response) => total + scoreByReaction[response.reaction],
        0,
      );

      return {
        dishId: dish.dishId,
        dishName: dish.dishName,
        imageUrl: dish.imageUrl,
        position: dish.position,
        score,
        positiveCount: positiveUsers.size,
        superLikes,
        dislikes,
        skips,
        responsesCount: dishResponses.length,
      } satisfies PollResultItem;
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.positiveCount !== left.positiveCount) {
        return right.positiveCount - left.positiveCount;
      }
      if (right.superLikes !== left.superLikes) {
        return right.superLikes - left.superLikes;
      }
      if (left.dislikes !== right.dislikes) {
        return left.dislikes - right.dislikes;
      }
      return left.position - right.position;
    });
}

export function selectPollWinner(
  poll: Poll,
  results: readonly PollResultItem[],
): string | null {
  const minPositiveCount = Math.max(1, Math.ceil(poll.participants.length * 0.4));
  const eligible = results.filter((result) => result.positiveCount >= minPositiveCount);

  if (eligible.length > 0) {
    return eligible[0].dishId;
  }

  return results[0]?.dishId ?? null;
}
