import { Schema } from "effect";

export const DishId = Schema.UUID.pipe(Schema.brand("DishId"));

export type DishId = typeof DishId.Type;

export const makeDishId = Schema.decodeUnknownSync(DishId);
