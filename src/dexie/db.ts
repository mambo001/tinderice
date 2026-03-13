import { Dexie, type EntityTable } from "dexie";
import type { Session } from "../types";

export const db = new Dexie("Sessions") as Dexie & {
  sessions: EntityTable<Session, "id">;
};

db.version(2).stores({
  sessions: "++id, window, startedAt, endedAt, isArchived",
});
