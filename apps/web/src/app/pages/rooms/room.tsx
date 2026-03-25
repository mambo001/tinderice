import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useRoomContext } from "@/app/context/room";

function formatTimeLeft(deadlineAt: string) {
  const remainingMs = new Date(deadlineAt).getTime() - Date.now();

  if (remainingMs <= 0) {
    return "Ending now";
  }

  const totalMinutes = Math.ceil(remainingMs / 60_000);
  return `${totalMinutes} min left`;
}

export function Room() {
  const navigate = useNavigate();
  const { roomId = "" } = useParams<{ roomId: string }>();
  const {
    room,
    activePolls,
    roomMembers,
    roomPresence,
    getRoomById,
    getPollsByRoomId,
    getRoomMembersByIds,
    getRoomPresenceByRoomId,
    touchRoomPresence,
    isRoomLoading,
    isActivePollsLoading,
    isRoomMembersLoading,
    isRoomPresenceLoading,
  } = useRoomContext();
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    getRoomById(roomId);
    getPollsByRoomId(roomId);
  }, [getPollsByRoomId, getRoomById, roomId]);

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
      void Promise.all([
        touchRoomPresence(roomId),
        getRoomPresenceByRoomId(roomId),
      ]);
    }, 25_000);

    return () => window.clearInterval(interval);
  }, [
    getRoomMembersByIds,
    getRoomPresenceByRoomId,
    room?.members,
    roomId,
    touchRoomPresence,
  ]);

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

  const handleInvitePeopleClick = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}#/invite/room/${roomId}`;

    void (async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: room?.name ?? "Join my room",
            text: "Join this room on Tinderice",
            url: inviteUrl,
          });
        } else {
          await navigator.clipboard.writeText(inviteUrl);
        }

        setShareMessage("Room invite ready to share");
      } catch {
        setShareMessage("Could not share room invite");
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
        <Stack gap={1} alignItems="flex-start">
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            startIcon={<KeyboardBackspaceOutlinedIcon />}
          >
            Back
          </Button>
          <Chip label={`Room ${roomId.slice(0, 8)}`} variant="outlined" />
          <Typography variant="h4">
            {isRoomLoading ? "Loading room..." : (room?.name ?? "Room")}
          </Typography>
          <Typography color="text.secondary">
            {activeMemberCount} active now, {room?.members.length ?? 0} members, {activePolls.length} live polls.
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
        {shareMessage ? <Chip size="small" label={shareMessage} variant="outlined" /> : null}

        <Card variant="outlined">
          <CardContent>
            <Stack gap={2}>
              <Stack direction="row" alignItems="center" gap={1}>
                <PollOutlinedIcon fontSize="small" />
                <Typography variant="h6">Active Polls</Typography>
              </Stack>
              {isActivePollsLoading ? (
                <Typography color="text.secondary">
                  Loading active polls...
                </Typography>
              ) : activePolls.length === 0 ? (
                <Typography color="text.secondary">
                  No active polls yet. Create one to start voting.
                </Typography>
              ) : (
                <Stack gap={1}>
                  {activePolls.map((poll) => (
                    <Card key={poll.id} variant="outlined">
                      <CardActionArea
                        onClick={() => navigate(`/poll/${poll.id}`)}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            gap={2}
                          >
                            <Box>
                              <Typography fontWeight={600}>
                                {poll.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Voting now with {poll.participants.length} participants
                              </Typography>
                            </Box>
                            <Stack gap={1} alignItems="flex-end">
                              <Chip size="small" label="Active" color="success" />
                              <Chip
                                size="small"
                                variant="outlined"
                                color="warning"
                                label={formatTimeLeft(poll.deadlineAt)}
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
            <Stack gap={2}>
              <Stack direction="row" alignItems="center" gap={1}>
                <PeopleOutlineOutlinedIcon fontSize="small" />
                <Typography variant="h6">Members</Typography>
              </Stack>
              {isRoomMembersLoading || isRoomPresenceLoading ? (
                <Typography color="text.secondary">
                  Loading members...
                </Typography>
              ) : members.length ? (
                <Stack divider={<Divider flexItem />}>
                  {members.map((member) => (
                    <Stack
                      key={member.id}
                      direction="row"
                      alignItems="center"
                      gap={1.5}
                      justifyContent="space-between"
                      py={1}
                    >
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar>{member.name.slice(0, 1).toUpperCase()}</Avatar>
                        <Stack>
                          <Typography fontWeight={500}>
                            {member.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member.isOwner
                              ? "Room owner"
                              : member.isActive
                                ? "In the room now"
                                : "Recently active"}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" gap={1} flexWrap="wrap">
                        {member.isActive ? (
                          <Chip
                            size="small"
                            label="Active now"
                            color="success"
                          />
                        ) : null}
                        {member.isOwner ? (
                          <Chip size="small" label="Owner" variant="outlined" />
                        ) : null}
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
