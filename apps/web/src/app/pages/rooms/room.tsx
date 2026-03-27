import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import CrownOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Collapse,
  Container,
  Divider,
  IconButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router";

import { useRoomContext } from "@/app/context/room";
import { setLastVisitedRoomId } from "@/utils/room-navigation";

function formatTimeLeft(deadlineAt: string) {
  const remainingMs = new Date(deadlineAt).getTime() - Date.now();

  if (remainingMs <= 0) {
    return "Ending now";
  }

  const totalMinutes = Math.ceil(remainingMs / 60_000);
  return `${totalMinutes} min left`;
}

function formatEndedAt(endedAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(endedAt));
}

interface PollMetaItemProps {
  icon: ReactNode;
  label: string;
}

function PollMetaItem(props: PollMetaItemProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{ color: "text.secondary" }}
    >
      {props.icon}
      <Typography variant="caption" color="inherit">
        {props.label}
      </Typography>
    </Stack>
  );
}

function LiveMetaItem() {
  return (
    <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: "success.main" }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "success.main",
          flexShrink: 0,
        }}
      />
      <Typography variant="caption" color="inherit">
        Live
      </Typography>
    </Stack>
  );
}

type ShareMessage = {
  text: string;
  severity: "success" | "error";
};

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function SectionHeader(props: SectionHeaderProps) {
  const [hoverAnchorEl, setHoverAnchorEl] = useState<HTMLElement | null>(null);
  const [pinnedAnchorEl, setPinnedAnchorEl] = useState<HTMLElement | null>(
    null,
  );
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
    <Stack direction="row" alignItems="center" gap={1}>
      {props.icon}
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

export function Room() {
  const navigate = useNavigate();
  const { roomId = "" } = useParams<{ roomId: string }>();
  const {
    room,
    activePolls,
    completedPollSummaries,
    roomMembers,
    roomPresence,
    getRoomById,
    getCompletedPollSummariesByRoomId,
    getPollsByRoomId,
    getRoomMembersByIds,
    getRoomPresenceByRoomId,
    touchRoomPresence,
    isRoomLoading,
    isActivePollsLoading,
    isCompletedPollSummariesLoading,
    isRoomMembersLoading,
    isRoomPresenceLoading,
  } = useRoomContext();
  const [shareMessage, setShareMessage] = useState<ShareMessage | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    setLastVisitedRoomId(roomId);

    getRoomById(roomId);
    getPollsByRoomId(roomId);
    getCompletedPollSummariesByRoomId(roomId);
  }, [
    getCompletedPollSummariesByRoomId,
    getPollsByRoomId,
    getRoomById,
    roomId,
  ]);

  useEffect(() => {
    if (!roomId || !room?.members?.length) {
      return;
    }

    void Promise.all([
      getRoomMembersByIds(room.members),
      getRoomPresenceByRoomId(roomId),
      touchRoomPresence(roomId),
    ]);

    const interval = window.setInterval(() => {
      void touchRoomPresence(roomId);
    }, 25_000);

    return () => window.clearInterval(interval);
  }, [
    getRoomMembersByIds,
    getRoomPresenceByRoomId,
    room?.members,
    roomId,
    touchRoomPresence,
  ]);

  useEffect(() => {
    if (!shareMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShareMessage(null);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [shareMessage]);

  const members = useMemo(
    () =>
      (room?.members ?? [])
        .map((memberId) => {
          const profile = roomMembers.find((member) => member.id === memberId);
          const isActive = roomPresence.some(
            (presence) => presence.userId === memberId,
          );

          return {
            id: memberId,
            name: profile?.name ?? memberId,
            isActive,
            isOwner: memberId === room?.ownerId,
          };
        })
        .sort((left, right) => {
          if (left.isActive !== right.isActive) {
            return left.isActive ? -1 : 1;
          }

          if (left.isOwner !== right.isOwner) {
            return left.isOwner ? -1 : 1;
          }

          return left.name.localeCompare(right.name);
        }),
    [room?.members, room?.ownerId, roomMembers, roomPresence],
  );

  const activeMemberCount = useMemo(
    () => members.filter((member) => member.isActive).length,
    [members],
  );

  const recentPolls = useMemo(
    () => completedPollSummaries.slice(0, 3),
    [completedPollSummaries],
  );

  const olderPolls = useMemo(
    () => completedPollSummaries.slice(3),
    [completedPollSummaries],
  );

  const handleInvitePeopleClick = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}#/invite/room/${roomId}`;

    void (async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: room?.name ?? "Join my room",
            url: inviteUrl,
          });
        } else {
          await navigator.clipboard.writeText(inviteUrl);
        }

        setShareMessage({
          text: "Invite link ready to share",
          severity: "success",
        });
      } catch {
        setShareMessage({
          text: "Could not share invite link",
          severity: "error",
        });
      }
    })();
  };

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
      <Stack marginTop={0} paddingBottom={8} gap={2.5}>
        <Stack gap={0.75} alignItems="flex-start">
          {/* <Chip label={`Room ${roomId.slice(0, 8)}`} variant="outlined" /> */}
          <Typography variant="h4">
            {isRoomLoading ? "Loading room..." : (room?.name ?? "Room")}
          </Typography>
          {room ? (
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                variant="outlined"
                label={`${room.members.length} members`}
              />
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={`${activeMemberCount} active now`}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`${activePolls.length} live polls`}
              />
            </Stack>
          ) : null}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => navigate(`/room/${roomId}/poll/create`)}
          >
            Create Poll
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkOutlinedIcon />}
            onClick={handleInvitePeopleClick}
          >
            Invite People
          </Button>
        </Stack>
        {shareMessage ? (
          <Alert severity={shareMessage.severity} variant="outlined">
            {shareMessage.text}
          </Alert>
        ) : null}

        <Card variant="outlined">
          <CardContent>
            <Stack gap={1.75}>
              <SectionHeader
                icon={<PollOutlinedIcon fontSize="small" />}
                title="Active Polls"
                description="Jump back into the polls that still need votes."
              />
              {isActivePollsLoading ? (
                <Typography color="text.secondary">
                  Loading active polls...
                </Typography>
              ) : activePolls.length === 0 ? (
                <Typography color="text.secondary">
                  No active polls yet. Start one to get everyone voting.
                </Typography>
              ) : (
                <Stack gap={1}>
                  {activePolls.map((poll) => (
                    <Card key={poll.id} variant="outlined">
                      <CardActionArea
                        onClick={() => navigate(`/poll/${poll.id}`)}
                      >
                        <CardContent sx={{ py: 1.5 }}>
                          <Stack gap={0.75}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              gap={1}
                              flexWrap="wrap"
                              alignItems="center"
                            >
                              <Typography fontWeight={600}>
                                {poll.title}
                              </Typography>
                              <Stack
                                direction="row"
                                gap={1}
                                flexWrap="wrap"
                                alignItems="center"
                              >
                                <LiveMetaItem />
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                  label={formatTimeLeft(poll.deadlineAt)}
                                />
                              </Stack>
                            </Stack>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              gap={1}
                            >
                              <PollMetaItem
                                icon={<PeopleOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                                label={`${poll.participants.length} participants`}
                              />
                              <ArrowOutwardOutlinedIcon
                                fontSize="small"
                                sx={{ color: "text.secondary" }}
                              />
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack gap={1.75}>
              <SectionHeader
                icon={<EmojiEventsOutlinedIcon fontSize="small" />}
                title="Recent Polls"
                description="Review recent winners and reopen older results when you need them."
              />

              {isCompletedPollSummariesLoading ? (
                <Typography color="text.secondary">
                  Loading recent polls...
                </Typography>
              ) : completedPollSummaries.length === 0 ? (
                <Alert severity="info" variant="outlined">
                  No completed polls yet. Finished sessions will show up here.
                </Alert>
              ) : (
                <>
                  <Stack gap={1}>
                    {recentPolls.map((poll) => (
                      <Card key={poll.id} variant="outlined">
                        <CardActionArea
                          onClick={() => navigate(`/poll/${poll.id}`)}
                        >
                          <CardContent sx={{ py: 1.5 }}>
                            <Stack gap={0.5}>
                              <Stack
                                justifyContent="space-between"
                                direction="row"
                                gap={1.25}
                                flex={1}
                                flexWrap="wrap"
                                alignItems="center"
                              >
                                <Typography fontWeight={600}>
                                  {poll.title}
                                </Typography>
                                <PollMetaItem
                                  icon={
                                    <EmojiEventsOutlinedIcon
                                      sx={{ fontSize: 16 }}
                                    />
                                  }
                                  label={
                                    poll.winnerDishName ?? "No winner selected"
                                  }
                                />
                              </Stack>
                              <Stack
                                direction="row"
                                gap={1.25}
                                alignItems="center"
                                justifyContent="space-between"
                                flexWrap="wrap"
                              >
                                <PollMetaItem
                                  icon={
                                    <PeopleOutlineOutlinedIcon
                                      sx={{ fontSize: 16 }}
                                    />
                                  }
                                  label={`${poll.participantCount} participants`}
                                />
                                <PollMetaItem
                                  icon={
                                    <ScheduleOutlinedIcon
                                      sx={{ fontSize: 16 }}
                                    />
                                  }
                                  label={formatEndedAt(poll.endedAt)}
                                />
                              </Stack>
                            </Stack>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Stack>

                  {olderPolls.length > 0 ? (
                    <Card
                      variant="outlined"
                      sx={{
                        overflow: "hidden",
                        borderRadius: 3,
                      }}
                    >
                      <Button
                        fullWidth
                        variant="text"
                        onClick={() => setHistoryOpen((current) => !current)}
                        sx={{
                          justifyContent: "space-between",
                          px: 2,
                          py: 1.25,
                          color: "text.primary",
                          borderRadius: 0,
                        }}
                        endIcon={
                          <ExpandMoreOutlinedIcon
                            sx={{
                              transform: historyOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 180ms ease",
                            }}
                          />
                        }
                      >
                        {historyOpen ? "Hide older polls" : "Show older polls"}
                      </Button>
                      <Collapse in={historyOpen} timeout="auto" unmountOnExit>
                        <CardContent sx={{ pt: 1.5 }}>
                          <Stack gap={1}>
                            {olderPolls.map((poll) => (
                              <Card key={poll.id} variant="outlined">
                                <CardActionArea
                                  onClick={() => navigate(`/poll/${poll.id}`)}
                                >
                                  <CardContent sx={{ py: 1.5 }}>
                                    <Stack gap={0.5}>
                                      <Stack
                                        justifyContent="space-between"
                                        direction="row"
                                        gap={1.25}
                                        flex={1}
                                        flexWrap="wrap"
                                        alignItems="center"
                                      >
                                        <Typography fontWeight={600}>
                                          {poll.title}
                                        </Typography>
                                        <PollMetaItem
                                          icon={
                                            <EmojiEventsOutlinedIcon
                                              sx={{ fontSize: 16 }}
                                            />
                                          }
                                          label={
                                            poll.winnerDishName ??
                                            "No winner selected"
                                          }
                                        />
                                      </Stack>
                                      <Stack
                                        direction="row"
                                        gap={1.25}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        flexWrap="wrap"
                                      >
                                        <PollMetaItem
                                          icon={
                                            <PeopleOutlineOutlinedIcon
                                              sx={{ fontSize: 16 }}
                                            />
                                          }
                                          label={`${poll.participantCount} participants`}
                                        />
                                        <PollMetaItem
                                          icon={
                                            <ScheduleOutlinedIcon
                                              sx={{ fontSize: 16 }}
                                            />
                                          }
                                          label={formatEndedAt(poll.endedAt)}
                                        />
                                      </Stack>
                                    </Stack>
                                  </CardContent>
                                </CardActionArea>
                              </Card>
                            ))}
                          </Stack>
                        </CardContent>
                      </Collapse>
                    </Card>
                  ) : null}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack gap={1.75}>
              <SectionHeader
                icon={<PeopleOutlineOutlinedIcon fontSize="small" />}
                title="Members"
                description="See who is in the room and who is active right now."
              />
              {isRoomMembersLoading || isRoomPresenceLoading ? (
                <Typography color="text.secondary">
                  Loading members...
                </Typography>
              ) : members.length ? (
                <Stack divider={<Divider flexItem />}>
                  {members.map((member) => (
                    <Stack
                      key={member.id}
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      gap={1.5}
                      justifyContent="space-between"
                      py={1.25}
                    >
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Badge
                          overlap="circular"
                          variant="dot"
                          invisible={!member.isActive}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          sx={{
                            "& .MuiBadge-badge": {
                              backgroundColor: "success.main",
                              boxShadow: (theme) =>
                                `0 0 0 2px ${theme.palette.background.paper}`,
                            },
                          }}
                        >
                          <Avatar>
                            {member.name.slice(0, 1).toUpperCase()}
                          </Avatar>
                        </Badge>
                        <Stack>
                          <Stack direction="row" alignItems="center" gap={0.75}>
                            <Typography fontWeight={500}>
                              {member.name}
                            </Typography>
                            {member.isOwner ? (
                              <CrownOutlinedIcon
                                fontSize="small"
                                sx={{ color: "info.main", fontSize: 18 }}
                              />
                            ) : null}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No members found for this room.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
