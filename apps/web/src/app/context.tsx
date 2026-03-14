import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { addMilliseconds } from "date-fns";
import { useLiveQuery } from "dexie-react-hooks";

import { FastingWindow, type Session } from "../types";
import { db } from "../dexie/db";
import { HOUR_IN_MS } from "./contants";

interface FastSession {
  id: string;
  window: FastingWindow;
  start: Date | null;
  end: Date | null;
  isActive: boolean;
  setWindow: (window: FastingWindow) => void;
  startSession: () => void;
  endSession: () => void;
}

interface FastContext {
  currentSession: FastSession;
  sessions: readonly Session[];
}

const FastContext = createContext<FastContext>({
  sessions: [],
  currentSession: {
    id: "0",
    window: FastingWindow.literals[0],
    start: null,
    end: null,
    isActive: false,
    setWindow: (window: FastingWindow) => {},
    startSession: () => {},
    endSession: () => {},
  },
});

export function FastProvider(props: PropsWithChildren) {
  const sessions =
    useLiveQuery(() =>
      db.sessions.filter((session) => session.isArchived === false).toArray(),
    ) || [];
  const lastActiveSession = useLiveQuery(() =>
    db.sessions.filter((session) => session.endedAt === null).first(),
  );

  const [selectedWindow, setSelectedWindow] = useState<FastingWindow>(
    FastingWindow.literals[0],
  );

  const currentSession = useMemo(() => {
    if (!lastActiveSession?.startedAt || lastActiveSession.endedAt) {
      return {
        id: "0",
        window: selectedWindow,
        start: null,
        end: null,
        isActive: false,
      };
    }

    const parsedWindow = Number(lastActiveSession.window);
    const window = (
      Number.isFinite(parsedWindow) && parsedWindow > 0
        ? parsedWindow
        : selectedWindow
    ) as FastingWindow;
    const start = new Date(lastActiveSession.startedAt);
    const end = addMilliseconds(start, window * HOUR_IN_MS);

    return {
      id: lastActiveSession.id,
      window,
      start,
      end,
      isActive: true,
    };
  }, [lastActiveSession, selectedWindow]);

  const handleSetWindow = (window: FastingWindow) => {
    setSelectedWindow(window);
  };

  const startSession = async () => {
    const now = new Date();
    const id = await db.sessions.add({
      window: String(selectedWindow),
      startedAt: now,
      endedAt: null,
      isArchived: false,
    });
  };

  const endSession = async () => {
    await db.sessions.update(currentSession.id, {
      endedAt: new Date(),
    });
  };

  return (
    <FastContext.Provider
      value={{
        sessions,
        currentSession: {
          ...currentSession,
          setWindow: handleSetWindow,
          startSession,
          endSession,
        },
      }}
    >
      {props.children}
    </FastContext.Provider>
  );
}

// eslint-disable-next-line
export const useFastContext = () => {
  const context = useContext(FastContext);
  if (context === null) {
    throw new Error("useFastContext must be used within a FastProvider");
  }
  return context;
};
