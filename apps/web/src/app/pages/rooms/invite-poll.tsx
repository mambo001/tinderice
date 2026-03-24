import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useIdentityContext } from "@/app/context/identity";
import { useRoomContext } from "@/app/context/room";

export function InvitePoll() {
  const navigate = useNavigate();
  const { pollId = "" } = useParams<{ pollId: string }>();
  const { identity } = useIdentityContext();
  const { joinPoll, isJoiningPoll } = useRoomContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pollId || !identity?.id) {
      return;
    }

    void (async () => {
      try {
        setError(null);
        await joinPoll(pollId);
        navigate(`/poll/${pollId}`, { replace: true });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Failed to join poll");
      }
    })();
  }, [identity?.id, joinPoll, navigate, pollId]);

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
          <Chip icon={<LinkOutlinedIcon />} label="Poll invite" variant="outlined" />
          <Typography variant="h4">Joining poll</Typography>
          <Typography color="text.secondary">
            We are adding you to the room and poll before sending you in.
          </Typography>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack gap={2} alignItems="flex-start">
              {isJoiningPoll ? <CircularProgress size={24} /> : null}
              {error ? <Alert severity="error">{error}</Alert> : null}
              <Typography color="text.secondary">
                {error
                  ? "The invite could not be completed."
                  : "Please wait while we finish joining this poll."}
              </Typography>
              {error ? (
                <Button variant="contained" onClick={() => navigate(`/poll/${pollId}`)}>
                  Open poll anyway
                </Button>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
