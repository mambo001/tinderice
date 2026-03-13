import { useEffect, useState, useMemo, type ReactNode } from "react";
import CircularProgress, {
  type CircularProgressProps,
} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { formatDistance } from "date-fns";

import { useFastContext } from "../../context";
import type { Session } from "../../../types";

function toPercent(timeLeft: number, windowHours: number) {
  if (windowHours <= 0) return 0;
  return Math.floor((timeLeft / (windowHours * 3600)) * 100);
}

function formatDateDistance(date: Date | null) {
  return date ? formatDistance(new Date(), date) : "";
}

function useTimeLeft(end: Date | null) {
  const [timeLeft, setTimeLeft] = useState(() =>
    end ? (end.getTime() - Date.now()) / 1000 : 0,
  );

  useEffect(() => {
    if (!end) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft((end.getTime() - Date.now()) / 1000);

    const timerId = setInterval(() => {
      const remaining = (end.getTime() - Date.now()) / 1000;
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(timerId);
  }, [end]);

  return timeLeft;
}

export function CircularWithValueLabel() {
  const { currentSession, sessions } = useFastContext();
  const { end, window: fastWindow, isActive } = currentSession;

  const timeLeft = useTimeLeft(end);

  const hasElapsed = isActive && timeLeft <= 0;

  const progressValue = useMemo(() => {
    if (!isActive) return 0;
    if (hasElapsed) return 100;
    const percent = Math.abs(toPercent(timeLeft, fastWindow) - 100);
    return Math.min(100, Math.max(0, percent));
  }, [isActive, timeLeft, fastWindow, hasElapsed]);

  return (
    <CircularProgressWithLabel
      value={progressValue}
      label={
        isActive ? (
          hasElapsed ? (
            <Countup elapsed={Math.abs(timeLeft)} />
          ) : (
            <Countdown timeLeft={timeLeft} window={fastWindow} />
          )
        ) : (
          <ProgressBarInactiveSessionLabel sessions={sessions} />
        )
      }
    />
  );
}

type CircularProgressWithLabelProps = CircularProgressProps & {
  value: number;
  label: ReactNode;
};

function CircularProgressWithLabel({
  value,
  label,
  ...props
}: CircularProgressWithLabelProps) {
  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        display: "inline-flex",
      }}
    >
      <CircularProgress
        {...props}
        variant="determinate"
        size={350}
        value={value}
        enableTrackSlot
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

function Countdown({ timeLeft, window }: { timeLeft: number; window: number }) {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = Math.floor(timeLeft % 60);
  const formattedTimeLeft = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Stack alignItems={"center"}>
      <Typography variant="body1" sx={{ color: "text.secondary" }}>
        Remaining ({toPercent(timeLeft, window)}%)
      </Typography>
      <Typography variant="h5">{formattedTimeLeft}</Typography>
    </Stack>
  );
}

function Countup({ elapsed }: { elapsed: number }) {
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = Math.floor(elapsed % 60);
  const formattedElapsed = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <Stack alignItems={"center"}>
      <Typography variant="body1" sx={{ color: "success.main" }}>
        Goal reached!
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Extra time
      </Typography>
      <Typography variant="h5">{formattedElapsed}</Typography>
    </Stack>
  );
}

function ProgressBarInactiveSessionLabel({
  sessions,
}: {
  sessions: readonly Session[];
}) {
  if (sessions.length <= 0) {
    return (
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          maxWidth: 250,
          textAlign: "center",
        }}
      >
        Click <strong>Start Fasting</strong> to begin your first fast!
      </Typography>
    );
  }
  return (
    <Stack gap={1}>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          maxWidth: 250,
          textAlign: "center",
        }}
      >
        Time since last fast
      </Typography>
      <Typography
        variant="h6"
        sx={{
          maxWidth: 250,
          textAlign: "center",
        }}
      >
        {formatDateDistance(sessions[sessions.length - 1]?.endedAt ?? null)}
      </Typography>
    </Stack>
  );
}
