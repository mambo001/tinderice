import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { type PropsWithChildren, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useRoomContext } from "@/app/context/room";

function formatTimeLeft(deadlineAt: string) {
  const remainingMs = new Date(deadlineAt).getTime() - Date.now();

  if (remainingMs <= 0) {
    return "Ending now";
  }

  const totalMinutes = Math.ceil(remainingMs / 60_000);
  return `${totalMinutes} min left`;
}

function getInvitePath(value: string) {
  const normalized = value.trim();

  if (normalized.startsWith("#")) {
    return normalized.slice(1);
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const url = new URL(normalized);

    if (url.hash.startsWith("#/")) {
      return url.hash.slice(1);
    }

    if (url.pathname.startsWith("/invite/")) {
      return url.pathname;
    }
  } catch {
    return normalized;
  }

  return normalized;
}

export function Home() {
  const navigate = useNavigate();
  const {
    ownedRooms,
    memberRooms,
    allActivePolls,
    isOwnedRoomsLoading,
    isMemberRoomsLoading,
    isAllActivePollsLoading,
  } = useRoomContext();
  const [inviteLink, setInviteLink] = useState("");

  const roomCount = ownedRooms.length + memberRooms.length;
  const activePollCount = allActivePolls.length;

  const sortedActivePolls = useMemo(
    () =>
      [...allActivePolls].sort(
        (left, right) =>
          new Date(left.deadlineAt).getTime() -
          new Date(right.deadlineAt).getTime(),
      ),
    [allActivePolls],
  );

  const handleCreateRoomClick = () => {
    navigate("/room/create");
  };

  const handlePollClick = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const handleJoinInvite = () => {
    if (!inviteLink.trim()) {
      return;
    }

    navigate(getInvitePath(inviteLink));
  };

  return (
    <HomeLayout>
      <Stack gap={2.5}>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip
            icon={<PollOutlinedIcon />}
            label={`${activePollCount} active polls`}
          />
          <Chip
            icon={<MeetingRoomOutlinedIcon />}
            label={`${roomCount} rooms`}
            variant="outlined"
          />
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack gap={2.5}>
              <Stack gap={0.75}>
                <Typography variant="h6">Start here</Typography>
                <Typography color="text.secondary">
                  Pick the next move and keep the group momentum going.
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddOutlinedIcon />}
                  onClick={handleCreateRoomClick}
                >
                  Create room
                </Button>
              </Stack>

              <Stack gap={1.25}>
                <Typography variant="subtitle2">Join with invite</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
                  <TextField
                    fullWidth
                    placeholder="Paste an invite link"
                    value={inviteLink}
                    onChange={(event) => setInviteLink(event.target.value)}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<LinkOutlinedIcon />}
                    onClick={handleJoinInvite}
                    disabled={!inviteLink.trim()}
                  >
                    Join
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Stack gap={1}>
          <Typography variant="h6">Active Polls</Typography>
          <Typography color="text.secondary">
            Resume the poll that needs attention first.
          </Typography>
        </Stack>
        <ActivePollList
          polls={sortedActivePolls}
          isLoading={isAllActivePollsLoading}
          onPollClick={handlePollClick}
        />

        <Stack gap={1}>
          <Typography variant="h6">Your Rooms</Typography>
          <Typography color="text.secondary">
            Rooms you own and rooms you joined stay one tap away.
          </Typography>
        </Stack>
        <RoomSection
          title="Owned rooms"
          rooms={ownedRooms}
          isLoading={isOwnedRoomsLoading}
          onRoomClick={handleRoomClick}
          emptyLabel="No owned rooms yet"
        />
        <RoomSection
          title="Joined rooms"
          rooms={memberRooms}
          isLoading={isMemberRoomsLoading}
          onRoomClick={handleRoomClick}
          emptyLabel="No joined rooms yet"
        />
      </Stack>
    </HomeLayout>
  );
}

interface ActivePollListProps {
  polls: Array<{
    id: string;
    title: string;
    roomId: string;
    roomName: string;
    deadlineAt: string;
    participants: readonly string[];
  }>;
  isLoading: boolean;
  onPollClick: (pollId: string) => void;
}

function ActivePollList(props: ActivePollListProps) {
  if (props.isLoading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack alignItems="center" py={3}>
            <CircularProgress size={24} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (props.polls.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack gap={0.75}>
            <Typography fontWeight={600}>No active polls right now</Typography>
            <Typography color="text.secondary">
              Create a room or wait for a new invite to kick off the next
              decision.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack gap={1.25}>
      {props.polls.map((poll) => (
        <Card key={poll.id} variant="outlined">
          <CardActionArea onClick={() => props.onPollClick(poll.id)}>
            <CardContent>
              <Stack gap={1.5}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  gap={1.5}
                >
                  <Stack gap={0.5}>
                    <Typography fontWeight={600}>{poll.title}</Typography>
                    <Typography color="text.secondary">
                      {poll.roomName}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    gap={1}
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Chip
                      size="small"
                      color="warning"
                      label={formatTimeLeft(poll.deadlineAt)}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${poll.participants.length} participants`}
                    />
                  </Stack>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Resume voting before the timer runs out.
                  </Typography>
                  <ArrowOutwardOutlinedIcon fontSize="small" />
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}

interface RoomSectionProps {
  title: string;
  rooms: Array<{
    id: string;
    name: string;
  }>;
  isLoading: boolean;
  onRoomClick: (roomId: string) => void;
  emptyLabel: string;
}

function RoomSection(props: RoomSectionProps) {
  return (
    <Stack gap={1}>
      <Typography variant="subtitle2">{props.title}</Typography>
      <RoomList
        rooms={props.rooms}
        isLoading={props.isLoading}
        onRoomClick={props.onRoomClick}
        emptyLabel={props.emptyLabel}
      />
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
      <Card variant="outlined">
        <CardContent>
          <Stack alignItems="center" py={3}>
            <CircularProgress size={24} />
          </Stack>
        </CardContent>
      </Card>
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
        <Card key={room.id} variant="outlined">
          <CardActionArea onClick={() => props.onRoomClick(room.id)}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>{room.name}</Typography>
                <ArrowOutwardOutlinedIcon fontSize="small" />
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
      <Card variant="outlined">
        <CardContent>
          <Stack gap={2}>
            <Typography variant="h5">Loading home...</Typography>
            <CircularProgress size={24} />
          </Stack>
        </CardContent>
      </Card>
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
      <Stack marginTop={2} paddingBottom={8} gap={2}>
        {props.children}
      </Stack>
    </Container>
  );
}
