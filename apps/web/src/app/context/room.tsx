import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Schema } from "effect";

import { useIdentityContext } from "@/app/context/identity";

const API_URL = import.meta.env.VITE_API_URL;

const Room = Schema.Struct({
  id: Schema.String,
  ownerId: Schema.String,
  name: Schema.String,
  members: Schema.Array(Schema.String),
  createdAt: Schema.String,
});

const Poll = Schema.Struct({
  id: Schema.String,
  roomId: Schema.String,
  ownerId: Schema.String,
  title: Schema.String,
  participants: Schema.Array(Schema.String),
  winnerDishId: Schema.NullOr(Schema.String),
  startedAt: Schema.String,
  deadlineAt: Schema.String,
  endedAt: Schema.NullOr(Schema.String),
  isActive: Schema.Boolean,
});

const PollDish = Schema.Struct({
  pollId: Schema.String,
  dishId: Schema.String,
  dishName: Schema.String,
  imageUrl: Schema.String,
  position: Schema.Number,
});

const PollResponse = Schema.Struct({
  pollId: Schema.String,
  dishId: Schema.String,
  userId: Schema.String,
  reaction: Schema.Literal("dislike", "like", "superLike", "skip"),
  respondedAt: Schema.String,
});

const CreateRoomResponse = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  createdAt: Schema.String,
});

const CreatePollResponse = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  startedAt: Schema.String,
  deadlineAt: Schema.String,
  endedAt: Schema.NullOr(Schema.String),
  isActive: Schema.Boolean,
});

const RespondToPollResponse = Schema.Struct({
  pollId: Schema.String,
  dishId: Schema.String,
  userId: Schema.String,
  reaction: Schema.Literal("dislike", "like", "superLike", "skip"),
  isComplete: Schema.Boolean,
  winnerDishId: Schema.NullOr(Schema.String),
});

type Room = typeof Room.Type;
type Poll = typeof Poll.Type;
type PollDish = typeof PollDish.Type;
type PollResponse = typeof PollResponse.Type;
type CreateRoomResponse = typeof CreateRoomResponse.Type;
type CreatePollResponse = typeof CreatePollResponse.Type;
type RespondToPollResponse = typeof RespondToPollResponse.Type;

const decodeRoom = Schema.decodeUnknownSync(Room);
const decodeRooms = Schema.decodeUnknownSync(Schema.Array(Room));
const decodePoll = Schema.decodeUnknownSync(Poll);
const decodePolls = Schema.decodeUnknownSync(Schema.Array(Poll));
const decodePollDishes = Schema.decodeUnknownSync(Schema.Array(PollDish));
const decodePollResponses = Schema.decodeUnknownSync(Schema.Array(PollResponse));
const decodeCreateRoomResponse = Schema.decodeUnknownSync(CreateRoomResponse);
const decodeCreatePollResponse = Schema.decodeUnknownSync(CreatePollResponse);
const decodeRespondToPollResponse = Schema.decodeUnknownSync(RespondToPollResponse);

interface CreateRoomInput {
  name: string;
}

interface CreatePollInput {
  roomId: string;
  title: string;
  participants: string[];
}

interface PollReactionInput {
  pollId: string;
  dishId: string;
  reaction: "dislike" | "like" | "superLike" | "skip";
}

interface RoomContext {
  room: Room | null;
  ownedRooms: Room[];
  memberRooms: Room[];
  rooms: Room[];
  activePolls: Poll[];
  poll: Poll | null;
  pollDishes: PollDish[];
  pollResponses: PollResponse[];
  isCreatingRoom: boolean;
  isCreatingPoll: boolean;
  isJoiningPoll: boolean;
  isRespondingToPoll: boolean;
  isRoomLoading: boolean;
  isOwnedRoomsLoading: boolean;
  isMemberRoomsLoading: boolean;
  isActivePollsLoading: boolean;
  isPollLoading: boolean;
  isPollDishesLoading: boolean;
  isPollResponsesLoading: boolean;
  createRoom: (input: CreateRoomInput) => Promise<CreateRoomResponse>;
  createPoll: (input: CreatePollInput) => Promise<CreatePollResponse>;
  joinPoll: (pollId: string) => Promise<void>;
  respondToPoll: (input: PollReactionInput) => Promise<RespondToPollResponse>;
  getRoomById: (roomId: string) => Promise<Room>;
  getOwnedRooms: () => Promise<Room[]>;
  getMemberRooms: () => Promise<Room[]>;
  getPollsByRoomId: (roomId: string) => Promise<Poll[]>;
  getPollById: (pollId: string) => Promise<Poll>;
  getPollDishesByPollId: (pollId: string) => Promise<PollDish[]>;
  getPollResponsesByPollId: (pollId: string) => Promise<PollResponse[]>;
  finishPoll: (pollId: string) => Promise<{ winnerDishId: string | null }>;
}

const RoomContext = createContext<RoomContext>({
  room: null,
  ownedRooms: [],
  memberRooms: [],
  rooms: [],
  activePolls: [],
  poll: null,
  pollDishes: [],
  pollResponses: [],
  isCreatingRoom: false,
  isCreatingPoll: false,
  isJoiningPoll: false,
  isRespondingToPoll: false,
  isRoomLoading: false,
  isOwnedRoomsLoading: false,
  isMemberRoomsLoading: false,
  isActivePollsLoading: false,
  isPollLoading: false,
  isPollDishesLoading: false,
  isPollResponsesLoading: false,
  createRoom: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  createPoll: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  joinPoll: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  respondToPoll: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getRoomById: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getOwnedRooms: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getMemberRooms: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getPollsByRoomId: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getPollById: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getPollDishesByPollId: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getPollResponsesByPollId: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  finishPoll: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
});

async function readJsonOrThrow<T>(
  response: Response,
  decoder: (value: unknown) => T,
) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const json = await response.json();
  return decoder(json);
}

export function RoomContextProvider(props: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { identity } = useIdentityContext();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedPollRoomId, setSelectedPollRoomId] = useState<string | null>(null);
  const [selectedPollDishesId, setSelectedPollDishesId] = useState<string | null>(null);
  const [selectedPollResponsesId, setSelectedPollResponsesId] = useState<string | null>(null);
  const identityId = identity?.id ?? null;

  const fetchRoomById = useCallback(async (roomId: string): Promise<Room> => {
    const response = await fetch(`${API_URL}/room/${roomId}`, {
      method: "GET",
    });

    return readJsonOrThrow(response, decodeRoom);
  }, []);

  const fetchOwnedRooms = useCallback(async (): Promise<Room[]> => {
    if (!identityId) {
      return [];
    }

    const response = await fetch(`${API_URL}/room/owner/${identityId}`, {
      method: "GET",
      headers: {
        "owner-id": identityId,
      },
    });

    const rooms = await readJsonOrThrow(response, decodeRooms);
    return [...rooms];
  }, [identityId]);

  const fetchMemberRooms = useCallback(async (): Promise<Room[]> => {
    if (!identityId) {
      return [];
    }

    const response = await fetch(`${API_URL}/room/member/${identityId}`, {
      method: "GET",
    });

    const rooms = await readJsonOrThrow(response, decodeRooms);
    return rooms.filter((room) => room.ownerId !== identityId);
  }, [identityId]);

  const fetchPollById = useCallback(async (pollId: string): Promise<Poll> => {
    const response = await fetch(`${API_URL}/poll/${pollId}`, {
      method: "GET",
    });

    return readJsonOrThrow(response, decodePoll);
  }, []);

  const fetchPollsByRoomId = useCallback(async (roomId: string): Promise<Poll[]> => {
    const response = await fetch(`${API_URL}/poll/room/${roomId}`, {
      method: "GET",
    });

    const polls = await readJsonOrThrow(response, decodePolls);
    return polls.filter((poll) => poll.isActive);
  }, []);

  const fetchPollDishesByPollId = useCallback(async (pollId: string): Promise<PollDish[]> => {
    const response = await fetch(`${API_URL}/poll/${pollId}/dishes`, {
      method: "GET",
    });

    const dishes = await readJsonOrThrow(response, decodePollDishes);
    return [...dishes];
  }, []);

  const fetchPollResponsesByPollId = useCallback(
    async (pollId: string): Promise<PollResponse[]> => {
      const response = await fetch(`${API_URL}/poll/${pollId}/responses`, {
        method: "GET",
      });

      const responses = await readJsonOrThrow(response, decodePollResponses);
      return [...responses];
    },
    [],
  );

  const roomQuery = useQuery({
    queryKey: ["room", selectedRoomId],
    enabled: selectedRoomId !== null,
    queryFn: async (): Promise<Room> => {
      if (!selectedRoomId) {
        throw new Error("Room id is required");
      }

      return fetchRoomById(selectedRoomId);
    },
  });

  const ownedRoomsQuery = useQuery({
    queryKey: ["rooms", "owned", identityId],
    enabled: Boolean(identityId),
    queryFn: fetchOwnedRooms,
  });

  const memberRoomsQuery = useQuery({
    queryKey: ["rooms", "member", identityId],
    enabled: Boolean(identityId),
    queryFn: fetchMemberRooms,
  });

  const activePollsQuery = useQuery({
    queryKey: ["polls", "room", selectedPollRoomId],
    enabled: selectedPollRoomId !== null,
    queryFn: async (): Promise<Poll[]> => {
      if (!selectedPollRoomId) {
        throw new Error("Room id is required");
      }

      return fetchPollsByRoomId(selectedPollRoomId);
    },
  });

  const pollQuery = useQuery({
    queryKey: ["poll", selectedPollId],
    enabled: selectedPollId !== null,
    queryFn: async (): Promise<Poll> => {
      if (!selectedPollId) {
        throw new Error("Poll id is required");
      }

      return fetchPollById(selectedPollId);
    },
  });

  const pollDishesQuery = useQuery({
    queryKey: ["poll", selectedPollDishesId, "dishes"],
    enabled: selectedPollDishesId !== null,
    queryFn: async (): Promise<PollDish[]> => {
      if (!selectedPollDishesId) {
        throw new Error("Poll id is required");
      }

      return fetchPollDishesByPollId(selectedPollDishesId);
    },
  });

  const pollResponsesQuery = useQuery({
    queryKey: ["poll", selectedPollResponsesId, "responses"],
    enabled: selectedPollResponsesId !== null,
    queryFn: async (): Promise<PollResponse[]> => {
      if (!selectedPollResponsesId) {
        throw new Error("Poll id is required");
      }

      return fetchPollResponsesByPollId(selectedPollResponsesId);
    },
  });

  const room = roomQuery.data ?? null;
  const ownedRooms = useMemo(() => ownedRoomsQuery.data ?? [], [ownedRoomsQuery.data]);
  const memberRooms = useMemo(
    () => memberRoomsQuery.data ?? [],
    [memberRoomsQuery.data],
  );
  const activePolls = useMemo(
    () => activePollsQuery.data ?? [],
    [activePollsQuery.data],
  );
  const poll = pollQuery.data ?? null;
  const pollDishes = useMemo(
    () => pollDishesQuery.data ?? [],
    [pollDishesQuery.data],
  );
  const pollResponses = useMemo(
    () => pollResponsesQuery.data ?? [],
    [pollResponsesQuery.data],
  );

  const rooms = useMemo(
    () =>
      [...ownedRooms, ...memberRooms].filter(
        (room, index, allRooms) =>
          allRooms.findIndex((candidate) => candidate.id === room.id) === index,
      ),
    [memberRooms, ownedRooms],
  );

  const getRoomById = useCallback(
    async (roomId: string) => {
      setSelectedRoomId(roomId);

      return queryClient.fetchQuery({
        queryKey: ["room", roomId],
        queryFn: () => fetchRoomById(roomId),
      });
    },
    [fetchRoomById, queryClient],
  );

  const getOwnedRooms = useCallback(async (): Promise<Room[]> => {
    if (!identityId) {
      return [];
    }

    return queryClient.fetchQuery({
      queryKey: ["rooms", "owned", identityId],
      queryFn: fetchOwnedRooms,
    });
  }, [fetchOwnedRooms, identityId, queryClient]);

  const getMemberRooms = useCallback(async (): Promise<Room[]> => {
    if (!identityId) {
      return [];
    }

    return queryClient.fetchQuery({
      queryKey: ["rooms", "member", identityId],
      queryFn: fetchMemberRooms,
    });
  }, [fetchMemberRooms, identityId, queryClient]);

  const getPollsByRoomId = useCallback(
    async (roomId: string): Promise<Poll[]> => {
      setSelectedPollRoomId(roomId);

      return queryClient.fetchQuery({
        queryKey: ["polls", "room", roomId],
        queryFn: () => fetchPollsByRoomId(roomId),
      });
    },
    [fetchPollsByRoomId, queryClient],
  );

  const getPollById = useCallback(
    async (pollId: string): Promise<Poll> => {
      setSelectedPollId(pollId);

      return queryClient.fetchQuery({
        queryKey: ["poll", pollId],
        queryFn: () => fetchPollById(pollId),
      });
    },
    [fetchPollById, queryClient],
  );

  const getPollDishesByPollId = useCallback(
    async (pollId: string): Promise<PollDish[]> => {
      setSelectedPollDishesId(pollId);

      return queryClient.fetchQuery({
        queryKey: ["poll", pollId, "dishes"],
        queryFn: () => fetchPollDishesByPollId(pollId),
      });
    },
    [fetchPollDishesByPollId, queryClient],
  );

  const getPollResponsesByPollId = useCallback(
    async (pollId: string): Promise<PollResponse[]> => {
      setSelectedPollResponsesId(pollId);

      return queryClient.fetchQuery({
        queryKey: ["poll", pollId, "responses"],
        queryFn: () => fetchPollResponsesByPollId(pollId),
      });
    },
    [fetchPollResponsesByPollId, queryClient],
  );

  const createRoomMutation = useMutation({
    mutationFn: async ({
      name,
    }: CreateRoomInput): Promise<CreateRoomResponse> => {
      if (!identity?.id) {
        throw new Error("Identity is required to create a room");
      }

      const response = await fetch(`${API_URL}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "owner-id": identity.id,
        },
        body: JSON.stringify({ name }),
      });

      return readJsonOrThrow(response, decodeCreateRoomResponse);
    },
    onSuccess: (createdRoom) => {
      if (!identityId) {
        return;
      }

      const nextRoom = {
        id: createdRoom.id,
        ownerId: identityId,
        name: createdRoom.name,
        members: [identityId],
        createdAt: createdRoom.createdAt,
      };

      queryClient.setQueryData<Room[]>(
        ["rooms", "owned", identityId],
        (currentRooms) => {
          if (!currentRooms) {
            return [nextRoom];
          }

          return [
            nextRoom,
            ...currentRooms.filter((room) => room.id !== nextRoom.id),
          ];
        },
      );
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async ({
      roomId,
      title,
      participants,
    }: CreatePollInput): Promise<CreatePollResponse> => {
      if (!identityId) {
        throw new Error("Identity is required to create a poll");
      }

      const response = await fetch(`${API_URL}/poll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "owner-id": identityId,
          "room-id": roomId,
        },
        body: JSON.stringify({ title, participants }),
      });

      return readJsonOrThrow(response, decodeCreatePollResponse);
    },
    onSuccess: (createdPoll, variables) => {
      if (!identityId) {
        return;
      }

      const participants = Array.from(new Set([...variables.participants, identityId]));

      const nextPoll = {
        id: createdPoll.id,
        roomId: variables.roomId,
        ownerId: identityId,
        title: createdPoll.title,
        participants,
        winnerDishId: null,
        startedAt: createdPoll.startedAt,
        deadlineAt: createdPoll.deadlineAt,
        endedAt: createdPoll.endedAt,
        isActive: createdPoll.isActive,
      };

      queryClient.setQueryData<Poll[]>(
        ["polls", "room", variables.roomId],
        (currentPolls) => {
          if (!currentPolls) {
            return [nextPoll];
          }

          return [
            nextPoll,
            ...currentPolls.filter((poll) => poll.id !== nextPoll.id),
          ];
        },
      );
    },
  });

  const joinPollMutation = useMutation({
    mutationFn: async (pollId: string): Promise<void> => {
      if (!identityId) {
        throw new Error("Identity is required to join a poll");
      }

      const response = await fetch(`${API_URL}/poll/${pollId}/join`, {
        method: "POST",
        headers: {
          "user-id": identityId,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    },
    onSuccess: async (_, pollId) => {
      const latestPoll = await queryClient.fetchQuery({
        queryKey: ["poll", pollId],
        queryFn: () => fetchPollById(pollId),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rooms", "owned", identityId] }),
        queryClient.invalidateQueries({ queryKey: ["rooms", "member", identityId] }),
        queryClient.invalidateQueries({ queryKey: ["room", latestPoll.roomId] }),
        queryClient.invalidateQueries({ queryKey: ["polls", "room", latestPoll.roomId] }),
      ]);
    },
  });

  const respondToPollMutation = useMutation({
    mutationFn: async ({ pollId, dishId, reaction }: PollReactionInput) => {
      if (!identityId) {
        throw new Error("Identity is required to respond to a poll");
      }

      const response = await fetch(`${API_URL}/poll/${pollId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": identityId,
        },
        body: JSON.stringify({ dishId, reaction }),
      });

      return readJsonOrThrow(response, decodeRespondToPollResponse);
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId] }),
        queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId, "responses"] }),
        queryClient.invalidateQueries({ queryKey: ["polls", "room"] }),
      ]);
    },
  });

  const finishPollMutation = useMutation({
    mutationFn: async (pollId: string): Promise<{ winnerDishId: string | null }> => {
      const response = await fetch(`${API_URL}/poll/${pollId}/finish`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.json() as Promise<{ winnerDishId: string | null }>;
    },
    onSuccess: async (_, pollId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["poll", pollId] }),
        queryClient.invalidateQueries({ queryKey: ["poll", pollId, "responses"] }),
      ]);
    },
  });

  return (
    <RoomContext.Provider
      value={{
        room,
        ownedRooms,
        memberRooms,
        rooms,
        activePolls,
        poll,
        pollDishes,
        pollResponses,
        isCreatingRoom: createRoomMutation.isPending,
        isCreatingPoll: createPollMutation.isPending,
        isJoiningPoll: joinPollMutation.isPending,
        isRespondingToPoll: respondToPollMutation.isPending,
        isRoomLoading: roomQuery.isLoading || roomQuery.isFetching,
        isOwnedRoomsLoading:
          ownedRoomsQuery.isLoading || ownedRoomsQuery.isFetching,
        isMemberRoomsLoading:
          memberRoomsQuery.isLoading || memberRoomsQuery.isFetching,
        isActivePollsLoading:
          activePollsQuery.isLoading || activePollsQuery.isFetching,
        isPollLoading: pollQuery.isLoading || pollQuery.isFetching,
        isPollDishesLoading:
          pollDishesQuery.isLoading || pollDishesQuery.isFetching,
        isPollResponsesLoading:
          pollResponsesQuery.isLoading || pollResponsesQuery.isFetching,
        createRoom: async (input) => createRoomMutation.mutateAsync(input),
        createPoll: async (input) => createPollMutation.mutateAsync(input),
        joinPoll: async (pollId) => joinPollMutation.mutateAsync(pollId),
        respondToPoll: async (input) => respondToPollMutation.mutateAsync(input),
        getRoomById,
        getOwnedRooms,
        getMemberRooms,
        getPollsByRoomId,
        getPollById,
        getPollDishesByPollId,
        getPollResponsesByPollId,
        finishPoll: async (pollId) => finishPollMutation.mutateAsync(pollId),
      }}
    >
      {props.children}
    </RoomContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoomContext() {
  const context = useContext(RoomContext);
  if (context === null) {
    throw new Error("useRoomContext must be used within a RoomContextProvider");
  }
  return context;
}
