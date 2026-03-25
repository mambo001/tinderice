import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  Typography,
  colors,
} from "@mui/material";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { useIdentityContext } from "@/app/context/identity";
import { useRoomContext } from "@/app/context/room";

type PollReaction = "dislike" | "like" | "superLike" | "skip";

function formatTimeRemaining(deadlineAt: string) {
  const remainingMs = new Date(deadlineAt).getTime() - Date.now();

  if (remainingMs <= 0) {
    return "Time is up";
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")} left`;
}

export function Poll() {
  const navigate = useNavigate();
  const { pollId = "" } = useParams<{ pollId: string }>();
  const { identity } = useIdentityContext();
  const {
    poll,
    pollDishes,
    pollResponses,
    getPollById,
    getPollDishesByPollId,
    getPollResponsesByPollId,
    respondToPoll,
    finishPoll,
    isPollLoading,
    isPollDishesLoading,
    isPollResponsesLoading,
    isRespondingToPoll,
  } = useRoomContext();
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [timeLabel, setTimeLabel] = useState<string>("");

  const inviteUrl = useMemo(() => {
    const hashPath = `#/invite/poll/${pollId}`;
    return `${window.location.origin}${window.location.pathname}${hashPath}`;
  }, [pollId]);

  useEffect(() => {
    if (!pollId) {
      return;
    }

    void Promise.all([
      getPollById(pollId),
      getPollDishesByPollId(pollId),
      getPollResponsesByPollId(pollId),
    ]);
  }, [getPollById, getPollDishesByPollId, getPollResponsesByPollId, pollId]);

  useEffect(() => {
    if (!poll?.deadlineAt || !poll.isActive) {
      setTimeLabel("");
      return;
    }

    const updateLabel = () => {
      setTimeLabel(formatTimeRemaining(poll.deadlineAt));
    };

    updateLabel();
    const interval = window.setInterval(updateLabel, 1000);

    return () => window.clearInterval(interval);
  }, [poll?.deadlineAt, poll?.isActive]);

  const userResponses = useMemo(
    () => pollResponses.filter((response) => response.userId === identity?.id),
    [identity?.id, pollResponses],
  );

  const currentDish = useMemo(
    () =>
      pollDishes.find(
        (dish) =>
          !userResponses.some((response) => response.dishId === dish.dishId),
      ) ?? null,
    [pollDishes, userResponses],
  );

  const progressLabel = `${userResponses.length}/${pollDishes.length || 20}`;

  const winnerDish = useMemo(
    () => pollDishes.find((dish) => dish.dishId === poll?.winnerDishId) ?? null,
    [poll?.winnerDishId, pollDishes],
  );

  const [emblaRef] = useEmblaCarousel({ loop: false, watchDrag: false });

  const handleShareInvite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: poll?.title ?? "Join my poll",
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
      }

      setShareMessage("Invite link ready to share");
    } catch {
      setShareMessage("Could not share invite link");
    }
  };

  const handleReaction = async (reaction: PollReaction) => {
    if (!currentDish || !pollId) {
      return;
    }

    try {
      setActionError(null);
      const result = await respondToPoll({
        pollId,
        dishId: currentDish.dishId,
        reaction,
      });

      await Promise.all([
        getPollById(pollId),
        getPollResponsesByPollId(pollId),
      ]);

      if (result.isComplete) {
        await getPollById(pollId);
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to save poll response",
      );
    }
  };

  const handleFinishPoll = async () => {
    try {
      setActionError(null);
      await finishPoll(pollId);
      await getPollById(pollId);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to finish poll",
      );
    }
  };

  const isLoading =
    isPollLoading || isPollDishesLoading || isPollResponsesLoading;

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
      <Stack paddingBottom={4} gap={2}>
        <Stack gap={1} alignItems="flex-start">
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            startIcon={<KeyboardBackspaceOutlinedIcon />}
          >
            Back
          </Button>
          <Typography variant="body1" fontWeight={500}>
            Poll ID: {pollId}
          </Typography>
          <Typography variant="h5">
            {isPollLoading
              ? "Loading poll..."
              : (poll?.title ?? "Untitled poll")}
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip label={`${progressLabel} answered`} variant="outlined" />
            {poll?.isActive ? (
              <Chip
                label={timeLabel || "Active"}
                color="warning"
                variant="outlined"
              />
            ) : (
              <Chip label="Completed" color="success" variant="outlined" />
            )}
          </Stack>
          <Stack direction="row" gap={1.5} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<IosShareOutlinedIcon />}
              onClick={handleShareInvite}
            >
              Share Invite
            </Button>
            {poll?.isActive ? (
              <Button variant="text" onClick={handleFinishPoll}>
                End Poll
              </Button>
            ) : null}
          </Stack>
          {shareMessage ? <Alert severity="info">{shareMessage}</Alert> : null}
          {actionError ? <Alert severity="error">{actionError}</Alert> : null}
        </Stack>

        {isLoading ? (
          <Card variant="outlined">
            <CardContent>
              <Stack alignItems="center" justifyContent="center" py={8}>
                <CircularProgress size={28} />
              </Stack>
            </CardContent>
          </Card>
        ) : !poll?.isActive ? (
          <Card variant="outlined">
            <CardContent>
              <Stack gap={2}>
                <Typography variant="h6">Poll complete</Typography>
                <Typography color="text.secondary">
                  {winnerDish
                    ? `Winning dish: ${winnerDish.dishName}`
                    : "No winning dish could be determined."}
                </Typography>
                {winnerDish ? (
                  <Card variant="outlined">
                    <CardMedia
                      component="img"
                      height="280"
                      image={winnerDish.imageUrl}
                      alt={winnerDish.dishName}
                    />
                    <CardContent>
                      <Typography variant="h6">
                        {winnerDish.dishName}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        ) : currentDish ? (
          <section className="embla" style={{ width: "100%" }}>
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container">
                <Card className="embla__slide" sx={{ pb: 4 }}>
                  <CardMedia
                    component="img"
                    height="320"
                    image={currentDish.imageUrl}
                    alt={currentDish.dishName}
                  />
                  <CardContent>
                    <Stack gap={1}>
                      <Typography variant="overline">
                        Dish {currentDish.position + 1}
                      </Typography>
                      <Typography gutterBottom variant="h5" component="div">
                        {currentDish.dishName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        React quickly so the group can land on a winner in under
                        five minutes.
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <Stack
                      flex={1}
                      direction="row"
                      justifyContent="center"
                      gap={2}
                    >
                      <IconButton
                        size="large"
                        onClick={() => handleReaction("skip")}
                        disabled={isRespondingToPoll}
                      >
                        <RefreshOutlinedIcon
                          sx={{ color: colors.yellow[600] }}
                        />
                      </IconButton>
                      <IconButton
                        size="large"
                        color="error"
                        onClick={() => handleReaction("dislike")}
                        disabled={isRespondingToPoll}
                      >
                        <CloseOutlinedIcon />
                      </IconButton>
                      <IconButton
                        size="large"
                        sx={{ color: colors.green[600] }}
                        onClick={() => handleReaction("like")}
                        disabled={isRespondingToPoll}
                      >
                        <ThumbUpOutlinedIcon />
                      </IconButton>
                      <IconButton
                        size="large"
                        sx={{ color: colors.pink[600] }}
                        onClick={() => handleReaction("superLike")}
                        disabled={isRespondingToPoll}
                      >
                        <FavoriteBorderOutlinedIcon />
                      </IconButton>
                    </Stack>
                  </CardActions>
                </Card>
              </div>
            </div>
          </section>
        ) : (
          <Card variant="outlined">
            <CardContent>
              <Typography color="text.secondary">
                You have answered all available dishes. Waiting for the poll to
                finish.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
