import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Box,
  Container,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import { addHours, format } from "date-fns";
import type { PropsWithChildren } from "react";

import { SplitButton } from "./split-button";
import { CircularWithValueLabel } from "./progress-bar";
import { useFastContext } from "../../context";

function endDateFromWindow(date: Date | null, window: number) {
  return date && addHours(date, window);
}

function formatNullableDate(date: Date | null) {
  return date ? format(date, "E, h:mm a") : "";
}

export function Home() {
  const { currentSession } = useFastContext();

  const handleStartFastingClick = () => {
    currentSession.startSession();
  };

  const handleStopFastingClick = () => {
    currentSession.endSession();
  };

  return (
    <HomeLayout>
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          flex: 1,
        }}
      >
        <CardHeader action={<SplitButton />} />
        <CardContent
          sx={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack gap={1}>
            <Box>
              <CircularWithValueLabel />
            </Box>
            {currentSession.isActive && (
              <Stack direction="row" gap={4} justifyContent="space-around">
                <Stack>
                  <Typography variant="caption" align="center">
                    Started
                  </Typography>
                  <Typography variant="body2" align="center" fontWeight={500}>
                    {formatNullableDate(currentSession.start)}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography variant="caption" align="center">
                    Goal
                  </Typography>
                  <Typography variant="body2" align="center" fontWeight={500}>
                    {formatNullableDate(
                      endDateFromWindow(
                        currentSession.start,
                        currentSession.window,
                      ),
                    )}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </CardContent>
        <CardActions sx={{ py: 4, justifyContent: "center" }}>
          {!currentSession.isActive ? (
            <Button variant="contained" onClick={handleStartFastingClick}>
              Start Fasting
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleStopFastingClick}
            >
              Break Fast
            </Button>
          )}
        </CardActions>
      </Card>
    </HomeLayout>
  );
}

export function HomeSkeleton() {
  return (
    <HomeLayout>
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          flex: 1,
        }}
      >
        <CardHeader
          action={<Skeleton variant="rectangular" width={100} height={36} />}
        />
        <CardContent
          sx={{
            display: "flex",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack gap={1}>
            <Box>
              <Skeleton variant="circular" width={350} height={350} />
            </Box>
          </Stack>
        </CardContent>
        <CardActions sx={{ py: 4, justifyContent: "center" }}>
          <Skeleton variant="rectangular" width={130} height={36} />
        </CardActions>
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
      <Stack marginTop={6} paddingBottom={4} gap={2} alignItems={"center"}>
        {props.children}
      </Stack>
    </Container>
  );
}
