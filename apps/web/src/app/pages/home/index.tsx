import {
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  CardActionArea,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import { type PropsWithChildren, useMemo } from "react";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { useNavigate } from "react-router";
import { useQueries } from "@tanstack/react-query";
import { Schema } from "effect";

import { useIdentityContext } from "@/app/context/identity";
import { useRoomContext } from "@/app/context/room";

const API_URL = import.meta.env.VITE_API_URL;

const Poll = Schema.Struct({
  id: Schema.String,
  roomId: Schema.String,
  ownerId: Schema.String,
  title: Schema.String,
  participants: Schema.Array(Schema.String),
  winnerDishId: Schema.NullOr(Schema.String),
  startedAt: Schema.String,
  endedAt: Schema.NullOr(Schema.String),
  isActive: Schema.Boolean,
});

const decodePolls = Schema.decodeUnknownSync(Schema.Array(Poll));

export function Home() {
  const navigate = useNavigate();
  const { identity } = useIdentityContext();
  const {
    ownedRooms,
    memberRooms,
    rooms,
    isOwnedRoomsLoading,
    isMemberRoomsLoading,
  } = useRoomContext();

  const activePollResults = useQueries({
    queries: rooms.map((room) => ({
      queryKey: ["polls", "room", room.id],
      enabled: rooms.length > 0,
      queryFn: async () => {
        const response = await fetch(`${API_URL}/poll/room/${room.id}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch polls for room ${room.id}`);
        }

        const json = await response.json();
        return decodePolls(json).filter((poll) => poll.isActive);
      },
    })),
  });

  const activePollsLoading =
    isOwnedRoomsLoading ||
    isMemberRoomsLoading ||
    activePollResults.some((result) => result.isLoading);

  const activePolls = useMemo(
    () =>
      activePollResults.flatMap((result, index) => {
        const room = rooms[index];

        if (!room || !result.data) {
          return [];
        }

        return result.data.map((poll) => ({
          ...poll,
          participants: [...poll.participants],
          roomName: room.name,
        }));
      }),
    [activePollResults, rooms],
  );

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleCreateRoomClick = async () => {
    navigate("/room/create");
  };

  const handlePollClick = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };

  return (
    <HomeLayout>
      <Typography variant="h5">
        Welcome, {identity ? identity.name : `<someone>`}
      </Typography>
      <Typography>Quick Actions</Typography>
      <Stack gap={1}>
        <Card>
          <CardActionArea onClick={() => console.log("")}>
            <CardContent>
              <Stack justifyContent={"space-between"} direction={"row"}>
                <Typography>Start Instant Poll</Typography>
                <ChevronRightOutlinedIcon />
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card>
          <CardActionArea onClick={handleCreateRoomClick}>
            <CardContent>
              <Stack justifyContent={"space-between"} direction={"row"}>
                <Typography>Create Room</Typography>
                <ChevronRightOutlinedIcon />
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      </Stack>
      <Typography>Active Polls</Typography>
      <ActivePollList
        polls={activePolls}
        isLoading={activePollsLoading}
        onPollClick={handlePollClick}
      />
      <Typography>Owned Rooms</Typography>
      <RoomList
        rooms={ownedRooms}
        isLoading={isOwnedRoomsLoading}
        onRoomClick={handleRoomClick}
        emptyLabel="No owned rooms yet"
      />
      <Typography>Joined Rooms</Typography>
      <RoomList
        rooms={memberRooms}
        isLoading={isMemberRoomsLoading}
        onRoomClick={handleRoomClick}
        emptyLabel="No joined rooms yet"
      />
    </HomeLayout>
  );
}

interface ActivePollListProps {
  polls: Array<{
    id: string;
    title: string;
    roomId: string;
    roomName: string;
    participants: string[];
  }>;
  isLoading: boolean;
  onPollClick: (pollId: string) => void;
}

function ActivePollList(props: ActivePollListProps) {
  if (props.isLoading) {
    return (
      <Stack gap={1}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="center">
              <CircularProgress size={24} />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  if (props.polls.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            No active polls across your rooms right now
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack gap={1}>
      {props.polls.map((poll) => (
        <Card key={poll.id}>
          <CardActionArea onClick={() => props.onPollClick(poll.id)}>
            <CardContent>
              <Stack gap={1.5}>
                <Stack justifyContent="space-between" direction="row" gap={1.5}>
                  <Typography fontWeight={600}>{poll.title}</Typography>
                  <ChevronRightOutlinedIcon />
                </Stack>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Chip size="small" label={poll.roomName} variant="outlined" />
                  <Typography variant="body2" color="text.secondary">
                    {poll.participants.length} participants
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}

interface RoomListProps {
  rooms: Array<{
    id: string;
    name: string;
  }>;
  isLoading: boolean;
  onRoomClick: (roomId: string) => void;
  emptyLabel: string;
}

function RoomList(props: RoomListProps) {
  if (props.isLoading) {
    return (
      <Stack gap={1}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="center">
              <CircularProgress size={24} />
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  if (props.rooms.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">{props.emptyLabel}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack gap={1}>
      {props.rooms.map((room) => (
        <Card key={room.id}>
          <CardActionArea onClick={() => props.onRoomClick(room.id)}>
            <CardContent>
              <Stack justifyContent={"space-between"} direction={"row"}>
                <Typography>{room.name}</Typography>
                <ChevronRightOutlinedIcon />
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}

export function HomeSkeleton() {
  return (
    <HomeLayout>
      <Stack gap={2}>
        <Typography variant="h5">Loading...</Typography>
        <Button disabled variant="outlined">
          Loading home
        </Button>
      </Stack>
    </HomeLayout>
  );
}

export function HomeLayout(props: PropsWithChildren) {
  return (
    <Container
      sx={{
        flex: 1,
        maxWidth: {
          xs: "100%",
          sm: "500px",
          md: "750px",
          lg: "800px",
          xl: "800px",
        },
      }}
    >
      <Stack marginTop={6} paddingBottom={8} gap={2}>
        {props.children}
      </Stack>
    </Container>
  );
}
