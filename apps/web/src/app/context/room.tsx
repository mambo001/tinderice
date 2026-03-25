import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

const PollResult = Schema.Struct({
  dishId: Schema.String,
  dishName: Schema.String,
  imageUrl: Schema.String,
  position: Schema.Number,
  score: Schema.Number,
  positiveCount: Schema.Number,
  superLikes: Schema.Number,
  dislikes: Schema.Number,
  skips: Schema.Number,
  responsesCount: Schema.Number,
});

const PollSummary = Schema.Struct({
  id: Schema.String,
  roomId: Schema.String,
  ownerId: Schema.String,
  title: Schema.String,
  participantCount: Schema.Number,
  winnerDishId: Schema.NullOr(Schema.String),
  winnerDishName: Schema.NullOr(Schema.String),
  startedAt: Schema.String,
  deadlineAt: Schema.String,
  endedAt: Schema.String,
});

const UserSummary = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.NullOr(Schema.String),
});

const RoomPresence = Schema.Struct({
  roomId: Schema.String,
  userId: Schema.String,
  lastSeenAt: Schema.String,
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
type PollResult = typeof PollResult.Type;
type PollSummary = typeof PollSummary.Type;
type UserSummary = typeof UserSummary.Type;
type RoomPresence = typeof RoomPresence.Type;
type CreateRoomResponse = typeof CreateRoomResponse.Type;
type CreatePollResponse = typeof CreatePollResponse.Type;
type RespondToPollResponse = typeof RespondToPollResponse.Type;

type PollWithRoomName = Poll & { roomName: string };

const decodeRoom = Schema.decodeUnknownSync(Room);
const decodeRooms = Schema.decodeUnknownSync(Schema.Array(Room));
const decodePoll = Schema.decodeUnknownSync(Poll);
const decodePolls = Schema.decodeUnknownSync(Schema.Array(Poll));
const decodePollDishes = Schema.decodeUnknownSync(Schema.Array(PollDish));
const decodePollResponses = Schema.decodeUnknownSync(Schema.Array(PollResponse));
const decodePollResults = Schema.decodeUnknownSync(Schema.Array(PollResult));
const decodePollSummaries = Schema.decodeUnknownSync(Schema.Array(PollSummary));
const decodeUserSummaries = Schema.decodeUnknownSync(Schema.Array(UserSummary));
const decodeRoomPresence = Schema.decodeUnknownSync(Schema.Array(RoomPresence));
const decodeCreateRoomResponse = Schema.decodeUnknownSync(CreateRoomResponse);
const decodeCreatePollResponse = Schema.decodeUnknownSync(CreatePollResponse);
const decodeRespondToPollResponse = Schema.decodeUnknownSync(
  RespondToPollResponse,
);

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
  roomPolls: Poll[];
  completedPollSummaries: PollSummary[];
  allActivePolls: PollWithRoomName[];
  poll: Poll | null;
  pollDishes: PollDish[];
  pollResponses: PollResponse[];
  pollResults: PollResult[];
  roomMembers: UserSummary[];
  roomPresence: RoomPresence[];
  isCreatingRoom: boolean;
  isCreatingPoll: boolean;
  isJoiningRoom: boolean;
  isJoiningPoll: boolean;
  isRespondingToPoll: boolean;
  isRoomLoading: boolean;
  isOwnedRoomsLoading: boolean;
  isMemberRoomsLoading: boolean;
  isActivePollsLoading: boolean;
  isCompletedPollSummariesLoading: boolean;
  isAllActivePollsLoading: boolean;
  isPollLoading: boolean;
  isPollDishesLoading: boolean;
  isPollResponsesLoading: boolean;
  isPollResultsLoading: boolean;
  isRoomMembersLoading: boolean;
  isRoomPresenceLoading: boolean;
  createRoom: (input: CreateRoomInput) => Promise<CreateRoomResponse>;
  createPoll: (input: CreatePollInput) => Promise<CreatePollResponse>;
  joinRoom: (roomId: string) => Promise<void>;
  joinPoll: (pollId: string) => Promise<void>;
  respondToPoll: (input: PollReactionInput) => Promise<RespondToPollResponse>;
  getRoomById: (roomId: string) => Promise<Room>;
  getOwnedRooms: () => Promise<Room[]>;
  getMemberRooms: () => Promise<Room[]>;
  getPollsByRoomId: (roomId: string) => Promise<Poll[]>;
  getCompletedPollSummariesByRoomId: (roomId: string) => Promise<PollSummary[]>;
  getAllActivePolls: () => Promise<PollWithRoomName[]>;
  getPollById: (pollId: string) => Promise<Poll>;
  getPollDishesByPollId: (pollId: string) => Promise<PollDish[]>;
  getPollResponsesByPollId: (pollId: string) => Promise<PollResponse[]>;
  getPollResultsByPollId: (pollId: string) => Promise<PollResult[]>;
  getRoomMembersByIds: (userIds: readonly string[]) => Promise<UserSummary[]>;
  getRoomPresenceByRoomId: (roomId: string) => Promise<RoomPresence[]>;
  touchRoomPresence: (roomId: string) => Promise<void>;
  finishPoll: (pollId: string) => Promise<{ winnerDishId: string | null }>;
}

const RoomContext = createContext<RoomContext>({
  room: null,
  ownedRooms: [],
  memberRooms: [],
  rooms: [],
  activePolls: [],
  roomPolls: [],
  completedPollSummaries: [],
  allActivePolls: [],
  poll: null,
  pollDishes: [],
  pollResponses: [],
  pollResults: [],
  roomMembers: [],
  roomPresence: [],
  isCreatingRoom: false,
  isCreatingPoll: false,
  isJoiningRoom: false,
  isJoiningPoll: false,
  isRespondingToPoll: false,
  isRoomLoading: false,
  isOwnedRoomsLoading: false,
  isMemberRoomsLoading: false,
  isActivePollsLoading: false,
  isCompletedPollSummariesLoading: false,
  isAllActivePollsLoading: false,
  isPollLoading: false,
  isPollDishesLoading: false,
  isPollResponsesLoading: false,
  isPollResultsLoading: false,
  isRoomMembersLoading: false,
  isRoomPresenceLoading: false,
  createRoom: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  createPoll: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  joinRoom: async () => {
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
  getCompletedPollSummariesByRoomId: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getAllActivePolls: async () => {
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
  getPollResultsByPollId: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getRoomMembersByIds: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  getRoomPresenceByRoomId: async () => {
    throw new Error("RoomContextProvider is not mounted");
  },
  touchRoomPresence: async () => {
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
  const [selectedPollDishesId, setSelectedPollDishesId] = useState<string | null>(
    null,
  );
  const [selectedPollResponsesId, setSelectedPollResponsesId] = useState<
    string | null
  >(null);
  const [selectedPollResultsId, setSelectedPollResultsId] = useState<string | null>(
    null,
  );
  const [selectedCompletedPollRoomId, setSelectedCompletedPollRoomId] = useState<
    string | null
  >(null);
  const [selectedRoomPresenceId, setSelectedRoomPresenceId] = useState<string | null>(
    null,
  );
  const [selectedRoomMemberIds, setSelectedRoomMemberIds] = useState<string[]>([]);
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
        "x-owner-id": identityId,
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
    return [...polls];
  }, []);

  const fetchCompletedPollSummariesByRoomId = useCallback(
    async (roomId: string): Promise<PollSummary[]> => {
      const response = await fetch(`${API_URL}/poll/room/${roomId}/completed`, {
        method: "GET",
      });

      const summaries = await readJsonOrThrow(response, decodePollSummaries);
      return [...summaries];
    },
    [],
  );

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
        headers: identityId
          ? {
              "x-user-id": identityId,
            }
          : undefined,
      });

      const responses = await readJsonOrThrow(response, decodePollResponses);
      return [...responses];
    },
    [identityId],
  );

  const fetchPollResultsByPollId = useCallback(async (pollId: string): Promise<PollResult[]> => {
    const response = await fetch(`${API_URL}/poll/${pollId}/results`, {
      method: "GET",
    });

    const results = await readJsonOrThrow(response, decodePollResults);
    return [...results];
  }, []);

  const fetchRoomMembersByIds = useCallback(async (userIds: readonly string[]): Promise<UserSummary[]> => {
    if (userIds.length === 0) {
      return [];
    }

    const response = await fetch(`${API_URL}/user/lookup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: userIds }),
    });

    const users = await readJsonOrThrow(response, decodeUserSummaries);
    return [...users];
  }, []);

  const fetchRoomPresenceByRoomId = useCallback(async (roomId: string): Promise<RoomPresence[]> => {
    const response = await fetch(`${API_URL}/room/${roomId}/presence`, {
      method: "GET",
    });

    const presence = await readJsonOrThrow(response, decodeRoomPresence);
    return [...presence];
  }, []);

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

  const pollResultsQuery = useQuery({
    queryKey: ["poll", selectedPollResultsId, "results"],
    enabled: selectedPollResultsId !== null,
    queryFn: async (): Promise<PollResult[]> => {
      if (!selectedPollResultsId) {
        throw new Error("Poll id is required");
      }

      return fetchPollResultsByPollId(selectedPollResultsId);
    },
  });

  const completedPollSummariesQuery = useQuery({
    queryKey: ["polls", "room", selectedCompletedPollRoomId, "completed"],
    enabled: selectedCompletedPollRoomId !== null,
    queryFn: async (): Promise<PollSummary[]> => {
      if (!selectedCompletedPollRoomId) {
        throw new Error("Room id is required");
      }

      return fetchCompletedPollSummariesByRoomId(selectedCompletedPollRoomId);
    },
  });

  const roomMembersQuery = useQuery({
    queryKey: ["room-members", ...selectedRoomMemberIds],
    enabled: selectedRoomMemberIds.length > 0,
    queryFn: async (): Promise<UserSummary[]> => fetchRoomMembersByIds(selectedRoomMemberIds),
  });

  const roomPresenceQuery = useQuery({
    queryKey: ["room", selectedRoomPresenceId, "presence"],
    enabled: selectedRoomPresenceId !== null,
    queryFn: async (): Promise<RoomPresence[]> => {
      if (!selectedRoomPresenceId) {
        throw new Error("Room id is required");
      }

      return fetchRoomPresenceByRoomId(selectedRoomPresenceId);
    },
  });

  const room = roomQuery.data ?? null;
  const ownedRooms = useMemo(() => ownedRoomsQuery.data ?? [], [ownedRoomsQuery.data]);
  const memberRooms = useMemo(
    () => memberRoomsQuery.data ?? [],
    [memberRoomsQuery.data],
  );
  const roomPolls = useMemo(() => activePollsQuery.data ?? [], [activePollsQuery.data]);
  const activePolls = useMemo(
    () => roomPolls.filter((poll) => poll.isActive),
    [roomPolls],
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
  const pollResults = useMemo(
    () => pollResultsQuery.data ?? [],
    [pollResultsQuery.data],
  );
  const completedPollSummaries = useMemo(
    () => completedPollSummariesQuery.data ?? [],
    [completedPollSummariesQuery.data],
  );
  const roomMembers = useMemo(
    () => roomMembersQuery.data ?? [],
    [roomMembersQuery.data],
  );
  const roomPresence = useMemo(
    () => roomPresenceQuery.data ?? [],
    [roomPresenceQuery.data],
  );

  const rooms = useMemo(
    () =>
      [...ownedRooms, ...memberRooms].filter(
        (room, index, allRooms) =>
          allRooms.findIndex((candidate) => candidate.id === room.id) === index,
      ),
    [memberRooms, ownedRooms],
  );

  useEffect(() => {
    void Promise.all(
      rooms.map((room) =>
        queryClient.prefetchQuery({
          queryKey: ["polls", "room", room.id],
          queryFn: () => fetchPollsByRoomId(room.id),
        }),
      ),
    );
  }, [fetchPollsByRoomId, queryClient, rooms]);

  const allActivePolls = useMemo(
    () =>
      rooms.flatMap((room) => {
        const polls = queryClient.getQueryData<Poll[]>(["polls", "room", room.id]) ?? [];

        return polls.map((poll) => ({
          ...poll,
          roomName: room.name,
        }));
      }),
    [queryClient, rooms],
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

  const getCompletedPollSummariesByRoomId = useCallback(
    async (roomId: string): Promise<PollSummary[]> => {
      setSelectedCompletedPollRoomId(roomId);

      return queryClient.fetchQuery({
        queryKey: ["polls", "room", roomId, "completed"],
        queryFn: () => fetchCompletedPollSummariesByRoomId(roomId),
      });
    },
    [fetchCompletedPollSummariesByRoomId, queryClient],
  );

  const getAllActivePolls = useCallback(async (): Promise<PollWithRoomName[]> => {
    const nextRooms =
      rooms.length > 0 ? rooms : [...(await getOwnedRooms()), ...(await getMemberRooms())];

    const uniqueRooms = nextRooms.filter(
      (room, index, allRooms) =>
        allRooms.findIndex((candidate) => candidate.id === room.id) === index,
    );

    const pollsByRoom = await Promise.all(
      uniqueRooms.map(async (room) => ({
        roomName: room.name,
        polls: await queryClient.fetchQuery({
          queryKey: ["polls", "room", room.id],
          queryFn: () => fetchPollsByRoomId(room.id),
        }),
      })),
    );

    return pollsByRoom.flatMap(({ roomName, polls }) =>
      polls.map((poll) => ({
        ...poll,
        roomName,
      })),
    );
  }, [fetchPollsByRoomId, getMemberRooms, getOwnedRooms, queryClient, rooms]);

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

  const getPollResultsByPollId = useCallback(
    async (pollId: string): Promise<PollResult[]> => {
      setSelectedPollResultsId(pollId);

      return queryClient.fetchQuery({
        queryKey: ["poll", pollId, "results"],
        queryFn: () => fetchPollResultsByPollId(pollId),
      });
    },
    [fetchPollResultsByPollId, queryClient],
  );

  const getRoomMembersByIds = useCallback(
    async (userIds: readonly string[]): Promise<UserSummary[]> => {
      const uniqueIds = Array.from(new Set(userIds));
      setSelectedRoomMemberIds(uniqueIds);

      if (uniqueIds.length === 0) {
        return [];
      }

      return queryClient.fetchQuery({
        queryKey: ["room-members", ...uniqueIds],
        queryFn: () => fetchRoomMembersByIds(uniqueIds),
      });
    },
    [fetchRoomMembersByIds, queryClient],
  );

  const getRoomPresenceByRoomId = useCallback(
    async (roomId: string): Promise<RoomPresence[]> => {
      setSelectedRoomPresenceId(roomId);

      return queryClient.fetchQuery({
        queryKey: ["room", roomId, "presence"],
        queryFn: () => fetchRoomPresenceByRoomId(roomId),
      });
    },
    [fetchRoomPresenceByRoomId, queryClient],
  );

  const touchRoomPresence = useCallback(
    async (roomId: string): Promise<void> => {
      if (!identityId) {
        throw new Error("Identity is required to update room presence");
      }

      const response = await fetch(`${API_URL}/room/${roomId}/presence`, {
        method: "POST",
        headers: {
          "x-user-id": identityId,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      await queryClient.invalidateQueries({ queryKey: ["room", roomId, "presence"] });
    },
    [identityId, queryClient],
  );

  const createRoomMutation = useMutation({
    mutationFn: async ({ name }: CreateRoomInput): Promise<CreateRoomResponse> => {
      if (!identity?.id) {
        throw new Error("Identity is required to create a room");
      }

      const response = await fetch(`${API_URL}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-id": identity.id,
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

      queryClient.setQueryData<Room[]>(["rooms", "owned", identityId], (currentRooms) => {
        if (!currentRooms) {
          return [nextRoom];
        }

        return [nextRoom, ...currentRooms.filter((room) => room.id !== nextRoom.id)];
      });
    },
  });

  const createPollMutation = useMutation({
    mutationFn: async ({ roomId, title, participants }: CreatePollInput): Promise<CreatePollResponse> => {
      if (!identityId) {
        throw new Error("Identity is required to create a poll");
      }

      const response = await fetch(`${API_URL}/poll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-owner-id": identityId,
          "x-room-id": roomId,
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
      } satisfies Poll;

      queryClient.setQueryData<Poll[]>(["polls", "room", variables.roomId], (currentPolls) => {
        if (!currentPolls) {
          return [nextPoll];
        }

        return [nextPoll, ...currentPolls.filter((poll) => poll.id !== nextPoll.id)];
      });
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: string): Promise<void> => {
      if (!identityId) {
        throw new Error("Identity is required to join a room");
      }

      const response = await fetch(`${API_URL}/room/${roomId}/join`, {
        method: "POST",
        headers: {
          "x-user-id": identityId,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
    },
    onSuccess: async (_, roomId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rooms", "owned", identityId] }),
        queryClient.invalidateQueries({ queryKey: ["rooms", "member", identityId] }),
        queryClient.invalidateQueries({ queryKey: ["room", roomId] }),
        queryClient.invalidateQueries({ queryKey: ["polls", "room", roomId] }),
        queryClient.invalidateQueries({ queryKey: ["polls"] }),
      ]);
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
          "x-user-id": identityId,
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
          "x-user-id": identityId,
        },
        body: JSON.stringify({ dishId, reaction }),
      });

      return readJsonOrThrow(response, decodeRespondToPollResponse);
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId] }),
        queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId, "responses"] }),
        queryClient.invalidateQueries({ queryKey: ["poll", variables.pollId, "results"] }),
        queryClient.invalidateQueries({ queryKey: ["polls"] }),
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
        queryClient.invalidateQueries({ queryKey: ["poll", pollId, "results"] }),
        queryClient.invalidateQueries({ queryKey: ["polls"] }),
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
        roomPolls,
        completedPollSummaries,
        allActivePolls,
        poll,
        pollDishes,
        pollResponses,
        pollResults,
        roomMembers,
        roomPresence,
        isCreatingRoom: createRoomMutation.isPending,
        isCreatingPoll: createPollMutation.isPending,
        isJoiningRoom: joinRoomMutation.isPending,
        isJoiningPoll: joinPollMutation.isPending,
        isRespondingToPoll: respondToPollMutation.isPending,
        isRoomLoading: roomQuery.isLoading || roomQuery.isFetching,
        isOwnedRoomsLoading: ownedRoomsQuery.isLoading || ownedRoomsQuery.isFetching,
        isMemberRoomsLoading: memberRoomsQuery.isLoading || memberRoomsQuery.isFetching,
        isActivePollsLoading: activePollsQuery.isLoading || activePollsQuery.isFetching,
        isCompletedPollSummariesLoading:
          completedPollSummariesQuery.isLoading || completedPollSummariesQuery.isFetching,
        isAllActivePollsLoading:
          (ownedRoomsQuery.isLoading || ownedRoomsQuery.isFetching || memberRoomsQuery.isLoading || memberRoomsQuery.isFetching) &&
          rooms.length > 0,
        isPollLoading: pollQuery.isLoading || pollQuery.isFetching,
        isPollDishesLoading: pollDishesQuery.isLoading || pollDishesQuery.isFetching,
        isPollResponsesLoading:
          pollResponsesQuery.isLoading || pollResponsesQuery.isFetching,
        isPollResultsLoading: pollResultsQuery.isLoading || pollResultsQuery.isFetching,
        isRoomMembersLoading:
          roomMembersQuery.isLoading || roomMembersQuery.isFetching,
        isRoomPresenceLoading:
          roomPresenceQuery.isLoading || roomPresenceQuery.isFetching,
        createRoom: async (input) => createRoomMutation.mutateAsync(input),
        createPoll: async (input) => createPollMutation.mutateAsync(input),
        joinRoom: async (roomId) => joinRoomMutation.mutateAsync(roomId),
        joinPoll: async (pollId) => joinPollMutation.mutateAsync(pollId),
        respondToPoll: async (input) => respondToPollMutation.mutateAsync(input),
        getRoomById,
        getOwnedRooms,
        getMemberRooms,
        getPollsByRoomId,
        getCompletedPollSummariesByRoomId,
        getAllActivePolls,
        getPollById,
        getPollDishesByPollId,
        getPollResponsesByPollId,
        getPollResultsByPollId,
        getRoomMembersByIds,
        getRoomPresenceByRoomId,
        touchRoomPresence,
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
