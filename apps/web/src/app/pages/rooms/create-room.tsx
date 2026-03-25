import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
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
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { useIdentityContext } from "@/app/context/identity";
import { useRoomContext } from "@/app/context/room";

interface CreateRoomFormValues {
  name: string;
}

function validate(values: CreateRoomFormValues) {
  const errors: Partial<Record<keyof CreateRoomFormValues, string>> = {};

  if (!values.name?.trim()) {
    errors.name = "Room name is required";
  } else if (values.name.trim().length < 3) {
    errors.name = "Room name must be at least 3 characters";
  } else if (values.name.trim().length > 48) {
    errors.name = "Room name must be 48 characters or less";
  }

  return errors;
}

export function CreateRoom() {
  const navigate = useNavigate();
  const { identity } = useIdentityContext();
  const { createRoom, isCreatingRoom } = useRoomContext();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const initialValues = useMemo<CreateRoomFormValues>(
    () => ({
      name: identity?.name ? `${identity.name}'s Room` : "",
    }),
    [identity?.name],
  );

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSubmit = async (values: CreateRoomFormValues) => {
    setSubmitError(null);

    try {
      const room = await createRoom({
        name: values.name.trim(),
      });

      navigate(`/room/${room.id}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create room",
      );
    }
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
      <Stack marginTop={6} paddingBottom={8} gap={2.5}>
        <Stack gap={1} alignItems="flex-start">
          <Button
            variant="text"
            onClick={handleBackClick}
            startIcon={<KeyboardBackspaceOutlinedIcon />}
          >
            Back
          </Button>
          <Chip
            icon={<MeetingRoomOutlinedIcon />}
            label="Private room setup"
            variant="outlined"
          />
          <Typography variant="h4">Create a room</Typography>
          <Typography color="text.secondary">
            Give your room a name and start inviting people into your next
            round.
          </Typography>
        </Stack>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" justifyContent="space-between" gap={1.5}>
              <Stack gap={0.5}>
                <Typography variant="h6">Room details</Typography>
                <Typography variant="body2" color="text.secondary">
                  This room will be created under{" "}
                  {identity?.name ?? "your account"}.
                </Typography>
              </Stack>
              <Chip size="small" label="Owner" color="warning" />
            </Stack>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Form<CreateRoomFormValues>
              onSubmit={handleSubmit}
              initialValues={initialValues}
              validate={validate}
              render={({ handleSubmit, submitting, invalid }) => (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Stack gap={2.5}>
                    {submitError ? (
                      <Alert severity="error">{submitError}</Alert>
                    ) : null}

                    <TextField
                      name="name"
                      label="Room name"
                      placeholder="Friday dinner club"
                      required
                      fullWidth
                      margin="none"
                    />

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      gap={1.5}
                    >
                      <Typography variant="body2" color="text.secondary">
                        You can rename the room later if needed.
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                        <Button variant="text" onClick={handleBackClick}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={submitting || invalid || isCreatingRoom}
                        >
                          {isCreatingRoom ? "Creating..." : "Create room"}
                        </Button>
                      </Stack>
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
