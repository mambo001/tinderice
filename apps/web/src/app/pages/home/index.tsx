import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Collapse,
  CircularProgress,
  Container,
  IconButton,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { type MouseEvent, type PropsWithChildren, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useRoomContext } from "@/app/context/room";
import { getLastVisitedRoomId } from "@/utils/room-navigation";

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

function prioritizeRooms(
  rooms: Array<{
    id: string;
    name: string;
  }>,
  lastVisitedRoomId: string | null,
  activePollRoomIds: ReadonlySet<string>,
) {
  return rooms
    .map((room, index) => ({
      room,
      index,
      priority:
        (room.id === lastVisitedRoomId ? 2 : 0) +
        (activePollRoomIds.has(room.id) ? 1 : 0),
    }))
    .sort(
      (left, right) => right.priority - left.priority || left.index - right.index,
    )
    .map(({ room }) => room);
}

const ROOM_SECTION_PREVIEW_COUNT = 3;

interface SectionHeaderProps {
  title: string;
  description: string;
}

function SectionHeader(props: SectionHeaderProps) {
  const [hoverAnchorEl, setHoverAnchorEl] = useState<HTMLElement | null>(null);
  const [pinnedAnchorEl, setPinnedAnchorEl] = useState<HTMLElement | null>(null);
  const anchorEl = pinnedAnchorEl ?? hoverAnchorEl;
  const isPinnedOpen = Boolean(pinnedAnchorEl);

  const handleHoverOpen = (event: MouseEvent<HTMLElement>) => {
    if (isPinnedOpen) {
      return;
    }

    setHoverAnchorEl(event.currentTarget);
  };

  const handleToggle = (event: MouseEvent<HTMLElement>) => {
    if (isPinnedOpen) {
      setPinnedAnchorEl(null);
      return;
    }

    event.currentTarget.blur();
    setHoverAnchorEl(null);
    setPinnedAnchorEl(event.currentTarget);
  };

  const handleHoverClose = () => {
    if (isPinnedOpen) {
      return;
    }

    setHoverAnchorEl(null);
  };

  const handleClose = () => {
    setHoverAnchorEl(null);
    setPinnedAnchorEl(null);
  };

  return (
    <Stack direction="row" alignItems="center" gap={0.5}>
      <Typography variant="h6">{props.title}</Typography>
      <IconButton
        size="small"
        aria-label={`More info about ${props.title}`}
        onMouseEnter={handleHoverOpen}
        onMouseLeave={handleHoverClose}
        onClick={handleToggle}
        sx={{ p: 0.5 }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          root: {
            sx: {
              pointerEvents: isPinnedOpen ? "auto" : "none",
            },
          },
          paper: {
            sx: {
              mt: 0.5,
              maxWidth: 260,
              p: 1.25,
              pointerEvents: isPinnedOpen ? "auto" : "none",
            },
            onMouseLeave: handleHoverClose,
            onClick: () => {
              if (isPinnedOpen) {
                handleClose();
              }
            },
          },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {props.description}
        </Typography>
      </Popover>
    </Stack>
  );
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
  const [isJoinByLinkOpen, setIsJoinByLinkOpen] = useState(false);
  const lastVisitedRoomId = getLastVisitedRoomId();

  const roomCount = ownedRooms.length + memberRooms.length;
  const activePollCount = allActivePolls.length;
  const shouldShowOnboardingCard = roomCount === 0;
  const activePollRoomIds = useMemo(
    () => new Set(allActivePolls.map((poll) => poll.roomId)),
    [allActivePolls],
  );
  const activePollCountByRoomId = useMemo(() => {
    const counts = new Map<string, number>();

    for (const poll of allActivePolls) {
      counts.set(poll.roomId, (counts.get(poll.roomId) ?? 0) + 1);
    }

    return counts;
  }, [allActivePolls]);
  const prioritizedOwnedRooms = useMemo(
    () => prioritizeRooms(ownedRooms, lastVisitedRoomId, activePollRoomIds),
    [activePollRoomIds, lastVisitedRoomId, ownedRooms],
  );
  const prioritizedMemberRooms = useMemo(
    () => prioritizeRooms(memberRooms, lastVisitedRoomId, activePollRoomIds),
    [activePollRoomIds, lastVisitedRoomId, memberRooms],
  );
  const suggestedRoom = useMemo(() => {
    const rooms = [...prioritizedOwnedRooms, ...prioritizedMemberRooms];
    const lastVisitedRoom = rooms.find((room) => room.id === lastVisitedRoomId);

    return lastVisitedRoom ?? rooms[0] ?? null;
  }, [lastVisitedRoomId, prioritizedMemberRooms, prioritizedOwnedRooms]);

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

    const invitePath = getInvitePath(inviteLink);

    setInviteLink("");
    setIsJoinByLinkOpen(false);
    navigate(invitePath);
  };

  const handleInviteInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || !inviteLink.trim()) {
      return;
    }

    event.preventDefault();
    handleJoinInvite();
  };

  const handleJoinByLinkClick = () => {
    setIsJoinByLinkOpen((current) => !current);
  };

  return (
    <HomeLayout>
      <Stack gap={2.5}>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip
            icon={<PollOutlinedIcon />}
            label={`${activePollCount} active polls`}
            variant="outlined"
          />
          <Chip
            icon={<MeetingRoomOutlinedIcon />}
            label={`${roomCount} rooms`}
            variant="outlined"
          />
        </Stack>

        {shouldShowOnboardingCard ? (
          <Card variant="outlined">
            <CardContent>
              <Stack gap={2.25}>
                <Stack gap={0.75}>
                  <Typography variant="h6">Start here</Typography>
                  <Typography color="text.secondary">
                    Create your first room or join one with a link.
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
                  <Typography variant="subtitle2">Join with link</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
                    <TextField
                      fullWidth
                      placeholder="Paste a room or poll link"
                      value={inviteLink}
                      onChange={(event) => setInviteLink(event.target.value)}
                      onKeyDown={handleInviteInputKeyDown}
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
        ) : (
          <Card variant="outlined">
            <CardContent>
              <Stack gap={1.25}>
                <Stack gap={0.5}>
                  <SectionHeader
                    title="Quick actions"
                    description="Create another room or join one with a link."
                  />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
                  <Button
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    onClick={handleCreateRoomClick}
                  >
                    Create room
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LinkOutlinedIcon />}
                    onClick={handleJoinByLinkClick}
                  >
                    {isJoinByLinkOpen ? "Hide link field" : "Join by link"}
                  </Button>
                </Stack>

                {isJoinByLinkOpen ? (
                  <Stack gap={1}>
                    <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
                      <TextField
                        fullWidth
                        placeholder="Paste a room or poll link"
                        value={inviteLink}
                        onChange={(event) => setInviteLink(event.target.value)}
                        onKeyDown={handleInviteInputKeyDown}
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
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Stack gap={1}>
          <SectionHeader
            title="Active Polls"
            description="Resume the poll that needs attention first."
          />
        </Stack>
        <ActivePollList
          polls={sortedActivePolls}
          hasRooms={roomCount > 0}
          isLoading={isAllActivePollsLoading}
          onPollClick={handlePollClick}
          onSuggestedRoomClick={suggestedRoom ? () => handleRoomClick(suggestedRoom.id) : null}
          suggestedRoomName={suggestedRoom?.name ?? null}
        />

        <Stack gap={1}>
          <SectionHeader
            title="Your Rooms"
            description="Rooms you own and rooms you joined stay one tap away."
          />
        </Stack>
        <RoomSection
          title="Owned rooms"
          rooms={prioritizedOwnedRooms}
          lastVisitedRoomId={lastVisitedRoomId}
          activePollCountByRoomId={activePollCountByRoomId}
          isLoading={isOwnedRoomsLoading}
          onRoomClick={handleRoomClick}
          emptyLabel="No owned rooms yet"
        />
        <RoomSection
          title="Joined rooms"
          rooms={prioritizedMemberRooms}
          lastVisitedRoomId={lastVisitedRoomId}
          activePollCountByRoomId={activePollCountByRoomId}
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
  hasRooms: boolean;
  isLoading: boolean;
  onPollClick: (pollId: string) => void;
  onSuggestedRoomClick: (() => void) | null;
  suggestedRoomName: string | null;
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
          <Stack gap={1}>
            <Typography fontWeight={600}>No active polls right now</Typography>
            <Typography color="text.secondary">
              {props.hasRooms
                ? "Open one of your rooms to start a poll and get everyone voting."
                : "Create a room or wait for a new invite to kick off the next decision."}
            </Typography>
            {props.hasRooms && props.suggestedRoomName ? (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                Suggested room: {props.suggestedRoomName}
              </Typography>
            ) : null}
            {props.hasRooms && props.onSuggestedRoomClick ? (
              <Button
                variant="text"
                sx={{ alignSelf: "center" }}
                onClick={props.onSuggestedRoomClick}
                endIcon={<ArrowOutwardOutlinedIcon fontSize="small" />}
              >
                Open room
              </Button>
            ) : null}
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
  lastVisitedRoomId: string | null;
  activePollCountByRoomId: ReadonlyMap<string, number>;
  isLoading: boolean;
  onRoomClick: (roomId: string) => void;
  emptyLabel: string;
}

function RoomSection(props: RoomSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewRooms = props.rooms.slice(0, ROOM_SECTION_PREVIEW_COUNT);
  const overflowRooms = props.rooms.slice(ROOM_SECTION_PREVIEW_COUNT);
  const hasOverflow = overflowRooms.length > 0;

  return (
    <Stack gap={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <Typography variant="subtitle2">{props.title}</Typography>
        {hasOverflow ? (
          <Button
            size="small"
            variant="text"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? "Show less" : `Show ${overflowRooms.length} more`}
          </Button>
        ) : null}
      </Stack>
      <RoomList
        rooms={previewRooms}
        lastVisitedRoomId={props.lastVisitedRoomId}
        activePollCountByRoomId={props.activePollCountByRoomId}
        isLoading={props.isLoading}
        onRoomClick={props.onRoomClick}
        emptyLabel={props.emptyLabel}
      />
      {hasOverflow ? (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Stack marginTop={1}>
            <RoomList
              rooms={overflowRooms}
              lastVisitedRoomId={props.lastVisitedRoomId}
              activePollCountByRoomId={props.activePollCountByRoomId}
              isLoading={false}
              onRoomClick={props.onRoomClick}
              emptyLabel={props.emptyLabel}
              showIndicators={false}
            />
          </Stack>
        </Collapse>
      ) : null}
    </Stack>
  );
}

interface RoomListProps {
  rooms: Array<{
    id: string;
    name: string;
  }>;
  lastVisitedRoomId: string | null;
  activePollCountByRoomId: ReadonlyMap<string, number>;
  isLoading: boolean;
  onRoomClick: (roomId: string) => void;
  emptyLabel: string;
  showIndicators?: boolean;
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
      {props.rooms.map((room, index) => {
        const activePollCount = props.activePollCountByRoomId.get(room.id) ?? 0;
        const shouldShowIndicators = props.showIndicators !== false && index === 0;

        return (
          <Card
            key={room.id}
            variant="outlined"
            sx={
              shouldShowIndicators && room.id === props.lastVisitedRoomId
                ? {
                    borderLeftWidth: 4,
                    borderLeftStyle: "solid",
                    borderLeftColor: "primary.main",
                  }
                : undefined
            }
          >
            <CardActionArea onClick={() => props.onRoomClick(room.id)}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1.5}
                >
                  <Stack gap={0.75}>
                    <Typography>{room.name}</Typography>
                    {shouldShowIndicators && activePollCount > 0 ? (
                      <Stack direction="row" gap={0.75} flexWrap="wrap">
                        {activePollCount > 0 ? (
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label={`${activePollCount} live poll${activePollCount === 1 ? "" : "s"}`}
                          />
                        ) : null}
                      </Stack>
                    ) : null}
                  </Stack>
                  <ArrowOutwardOutlinedIcon fontSize="small" />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
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
