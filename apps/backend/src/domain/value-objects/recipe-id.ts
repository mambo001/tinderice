import { Schema } from "effect";

export const RecipeId = Schema.UUID.pipe(Schema.brand("RecipeId"));

export type RecipeId = typeof RecipeId.Type;

export const makeRecipeId = Schema.decodeUnknownSync(RecipeId);
