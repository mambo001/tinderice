import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { TextField } from "mui-rff";
import { Form } from "react-final-form";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useRoomContext } from "@/app/context/room";

interface CreatePollFormValues {
  title: string;
}

function getDefaultPollTitle(date: Date) {
  const hour = date.getHours();

  if (hour < 11) {
    return "Breakfast";
  }

  if (hour < 16) {
    return "Lunch";
  }

  return "Dinner";
}

function validate(values: CreatePollFormValues) {
  const errors: Partial<Record<keyof CreatePollFormValues, string>> = {};

  if (!values.title?.trim()) {
    errors.title = "Poll title is required";
  } else if (values.title.trim().length < 3) {
    errors.title = "Poll title must be at least 3 characters";
  }

  return errors;
}

export function CreatePoll() {
  const navigate = useNavigate();
  const { roomId = "" } = useParams<{ roomId: string }>();
  const { room, createPoll, getRoomById, isCreatingPoll, isRoomLoading } =
    useRoomContext();
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    void getRoomById(roomId);
  }, [getRoomById, roomId]);

  const initialValues = useMemo<CreatePollFormValues>(
    () => ({
      title: getDefaultPollTitle(new Date()),
    }),
    [],
  );

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
          <Chip icon={<PollOutlinedIcon />} label="New room poll" variant="outlined" />
          <Typography variant="h4">Create a poll</Typography>
          <Typography color="text.secondary">
            Start a new vote for this room and send everyone into the swipe flow.
          </Typography>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Form<CreatePollFormValues>
              key={room?.id ?? roomId}
              onSubmit={async (values) => {
                setSubmitError(null);

                try {
                  const createdPoll = await createPoll({
                    roomId,
                    title: values.title.trim(),
                    participants: [...(room?.members ?? [])],
                  });

                  navigate(`/poll/${createdPoll.id}`);
                } catch (error) {
                  setSubmitError(
                    error instanceof Error ? error.message : "Failed to create poll",
                  );
                }
              }}
              initialValues={initialValues}
              validate={validate}
              render={({ handleSubmit, invalid, submitting }) => (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack gap={2.5}>
                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                    <TextField
                      name="title"
                      label="Poll title"
                      placeholder="Friday dinner vote"
                      required
                      fullWidth
                      margin="none"
                    />

                    <Typography variant="body2" color="text.secondary">
                      {isRoomLoading
                        ? "Loading room members..."
                        : "Participants will default to everyone currently in this room."}
                    </Typography>

                    <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                      <Button variant="text" onClick={() => navigate(-1)}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={invalid || submitting || isCreatingPoll}
                      >
                        {isCreatingPoll ? "Creating..." : "Create poll"}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
            />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
