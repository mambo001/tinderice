import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
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
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useRoomContext } from "@/app/context/room";

export function Room() {
  const navigate = useNavigate();
  const { roomId = "" } = useParams<{ roomId: string }>();
  const {
    room,
    activePolls,
    getRoomById,
    getPollsByRoomId,
    isRoomLoading,
    isActivePollsLoading,
  } = useRoomContext();

  useEffect(() => {
    if (!roomId) {
      return;
    }

    getRoomById(roomId);
    getPollsByRoomId(roomId);
  }, [getPollsByRoomId, getRoomById, roomId]);

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
      <Stack marginTop={6} paddingBottom={8} gap={2.5}>
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
            Manage polls in this room, keep track of active voting, and see who
            is inside.
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => navigate(`/room/${roomId}/poll/create`)}
          >
            Create Poll
          </Button>
        </Stack>

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
                                {poll.participants.length} participants
                              </Typography>
                            </Box>
                            <Chip size="small" label="Active" color="success" />
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
              {room?.members?.length ? (
                <Stack divider={<Divider flexItem />}>
                  {room.members.map((memberId) => (
                    <Stack
                      key={memberId}
                      direction="row"
                      alignItems="center"
                      gap={1.5}
                      py={1}
                    >
                      <Avatar>{memberId.slice(0, 1).toUpperCase()}</Avatar>
                      <Stack>
                        <Typography fontWeight={500}>{memberId}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {memberId === room.ownerId ? "Room owner" : "Member"}
                        </Typography>
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
