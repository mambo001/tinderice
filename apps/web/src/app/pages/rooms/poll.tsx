import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Container,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";

import { useIdentityContext } from "@/app/context/identity";
import { useRoomContext } from "@/app/context/room";

type PollReaction = "dislike" | "like" | "superLike" | "skip";

function getRemainingTime(deadlineAt: string) {
  const remainingMs = new Date(deadlineAt).getTime() - Date.now();

  if (remainingMs <= 0) {
    return {
      label: "Time is up",
      shortLabel: "0:00",
      totalSeconds: 0,
      isCritical: true,
    };
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const shortLabel = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return {
    label: `${shortLabel} left`,
    shortLabel,
    totalSeconds,
    isCritical: totalSeconds <= 60,
  };
}

interface ReactionButtonProps {
  icon: ReactNode;
  label: string;
  color: string;
  onClick: () => void;
  disabled: boolean;
}

function ReactionButton(props: ReactionButtonProps) {
  return (
    <Button
      variant="outlined"
      onClick={props.onClick}
      disabled={props.disabled}
      sx={{
        minHeight: 76,
        borderRadius: 3,
        borderColor: "divider",
        color: "text.primary",
        px: 1.75,
        py: 1.25,
      }}
    >
      <Stack spacing={0.8} alignItems="center" width="100%">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 42,
            height: 42,
            borderRadius: 2,
            backgroundColor: props.color,
            color: "#fff",
          }}
        >
          {props.icon}
        </Box>
        <Typography fontWeight={600} variant="body2">
          {props.label}
        </Typography>
      </Stack>
    </Button>
  );
}

function PollOverlayTimer(props: { deadlineAt: string }) {
  const time = getRemainingTime(props.deadlineAt);

  return (
    <Box
      sx={{
        borderRadius: 999,
        px: 1.5,
        py: 1,
        border: "1px solid",
        borderColor: time.isCritical ? "error.main" : "divider",
        backgroundColor: time.isCritical
          ? "rgba(188, 71, 73, 0.12)"
          : "rgba(255, 255, 255, 0.96)",
        boxShadow: "0 10px 30px rgba(17, 24, 39, 0.08)",
        minWidth: 102,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1 }}
      >
        Time left
      </Typography>
      <Typography
        variant="h6"
        fontWeight={700}
        color={time.isCritical ? "error.main" : "text.primary"}
        sx={{ lineHeight: 1.1 }}
      >
        {time.shortLabel}
      </Typography>
    </Box>
  );
}

function PollBottomDrawer(props: {
  open: boolean;
  onToggle: () => void;
  isActive: boolean;
  participantCount: number;
  shareMessage: string | null;
  actionError: string | null;
  onShareInvite: () => void;
  onFinishPoll: () => void;
  standings: Array<{
    dishId: string;
    dishName: string;
    score: number;
    positiveCount: number;
    superLikes: number;
    dislikes: number;
  }>;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        position: "sticky",
        bottom: 12,
        borderRadius: 4,
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.94)",
      }}
    >
      <Button
        fullWidth
        variant="text"
        onClick={props.onToggle}
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
              transform: props.open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 180ms ease",
            }}
          />
        }
      >
        Poll details
      </Button>
      <Collapse in={props.open} timeout="auto" unmountOnExit>
        <CardContent>
          <Stack gap={2}>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip
                variant="outlined"
                label={`${props.participantCount} participants`}
              />
              <Chip
                label={props.isActive ? "Active poll" : "Completed"}
                color={props.isActive ? "success" : "default"}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
              <Button
                variant="outlined"
                startIcon={<IosShareOutlinedIcon />}
                onClick={props.onShareInvite}
              >
                Share invite
              </Button>
              {props.isActive ? (
                <Button variant="text" onClick={props.onFinishPoll}>
                  End poll
                </Button>
              ) : null}
            </Stack>

            {props.shareMessage ? (
              <Alert severity="info">{props.shareMessage}</Alert>
            ) : null}
            {props.actionError ? (
              <Alert severity="error">{props.actionError}</Alert>
            ) : null}

            {props.standings.length > 0 ? (
              <Stack gap={1.25}>
                <Typography variant="subtitle2">Standings</Typography>
                {props.standings.slice(0, 5).map((result, index) => (
                  <Card key={result.dishId} variant="outlined">
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Stack gap={0.75}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          gap={1.5}
                        >
                          <Typography fontWeight={600}>
                            {index + 1}. {result.dishName}
                          </Typography>
                          <Typography color="text.secondary">
                            Score {result.score}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {result.positiveCount} positive, {result.superLikes}{" "}
                          super-likes, {result.dislikes} dislikes
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : null}
          </Stack>
        </CardContent>
      </Collapse>
    </Card>
  );
}

function PollStageSkeleton() {
  return (
    <Stack gap={2} sx={{ flex: 1, justifyContent: "space-between" }}>
      <Card
        variant="outlined"
        sx={{
          overflow: "hidden",
          minHeight: { xs: 440, md: 520 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Skeleton variant="rectangular" sx={{ flex: 1, minHeight: 0 }} />
        <CardContent sx={{ pt: 2, pb: 2.5 }}>
          <Stack gap={0.75}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width="65%" height={48} />
          </Stack>
        </CardContent>
      </Card>

      <Stack gap={1.25}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Skeleton variant="text" width={140} />
          <Skeleton variant="text" width={90} />
        </Stack>
        <Stack direction="row" gap={1}>
          {[0, 1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              width="100%"
              height={76}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

export function Poll() {
  const navigate = useNavigate();
  const { pollId = "" } = useParams<{ pollId: string }>();
  const { identity } = useIdentityContext();
  const {
    poll,
    pollDishes,
    pollResponses,
    pollResults,
    touchRoomPresence,
    getPollById,
    getPollDishesByPollId,
    getPollResponsesByPollId,
    getPollResultsByPollId,
    respondToPoll,
    finishPoll,
    isPollLoading,
    isPollDishesLoading,
    isPollResponsesLoading,
    isPollResultsLoading,
    isRespondingToPoll,
  } = useRoomContext();
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      getPollResultsByPollId(pollId),
    ]);
  }, [
    getPollById,
    getPollDishesByPollId,
    getPollResponsesByPollId,
    getPollResultsByPollId,
    pollId,
  ]);

  useEffect(() => {
    if (!poll?.roomId) {
      return;
    }

    void touchRoomPresence(poll.roomId);

    const interval = window.setInterval(() => {
      void touchRoomPresence(poll.roomId);
    }, 25_000);

    return () => window.clearInterval(interval);
  }, [poll?.roomId, touchRoomPresence]);

  useEffect(() => {
    if (!poll?.deadlineAt || !poll.isActive) {
      return;
    }

    const interval = window.setInterval(() => {
      if (new Date(poll.deadlineAt).getTime() <= Date.now()) {
        void Promise.all([
          getPollById(pollId),
          getPollResponsesByPollId(pollId),
          getPollResultsByPollId(pollId),
        ]);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    getPollById,
    getPollResponsesByPollId,
    getPollResultsByPollId,
    poll?.deadlineAt,
    poll?.isActive,
    pollId,
  ]);

  const userResponses = useMemo(
    () => pollResponses.filter((response) => response.userId === identity?.id),
    [identity?.id, pollResponses],
  );

  const currentDish = useMemo(() => {
    const unseenDish = pollDishes.find(
      (dish) =>
        !userResponses.some((response) => response.dishId === dish.dishId),
    );

    if (unseenDish) {
      return unseenDish;
    }

    return (
      pollDishes.find((dish) => {
        const response = userResponses.find(
          (candidate) => candidate.dishId === dish.dishId,
        );

        return response?.reaction === "skip";
      }) ?? null
    );
  }, [pollDishes, userResponses]);

  const completedResponses = useMemo(
    () =>
      userResponses.filter((response) => response.reaction !== "skip").length,
    [userResponses],
  );

  const progressValue = pollDishes.length
    ? (completedResponses / pollDishes.length) * 100
    : 0;

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
        getPollResultsByPollId(pollId),
      ]);

      if (result.isComplete) {
        await Promise.all([
          getPollById(pollId),
          getPollResultsByPollId(pollId),
        ]);
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
      await Promise.all([getPollById(pollId), getPollResultsByPollId(pollId)]);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Failed to finish poll",
      );
    }
  };

  const isLoading =
    isPollLoading ||
    isPollDishesLoading ||
    isPollResponsesLoading ||
    isPollResultsLoading;

  const isInitialLoading = isLoading && (!poll || pollDishes.length === 0);

  const isTransitionLoading =
    Boolean(poll?.isActive) &&
    !currentDish &&
    (isRespondingToPoll || isPollResponsesLoading || isPollDishesLoading);

  const timer = poll?.deadlineAt ? getRemainingTime(poll.deadlineAt) : null;

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
      <Stack
        sx={{
          minHeight: "calc(100svh - 120px)",
          pt: 1,
          pb: 2,
        }}
        justifyContent="space-between"
        gap={2}
      >
        <Stack gap={2} sx={{ flex: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            gap={1.5}
          >
            <Button
              variant="text"
              onClick={() => navigate(-1)}
              startIcon={<KeyboardBackspaceOutlinedIcon />}
              sx={{ alignSelf: "flex-start" }}
            >
              Back
            </Button>
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              <Chip
                variant="outlined"
                label={`${completedResponses}/${pollDishes.length || 20}`}
                sx={{ backgroundColor: "rgba(255,255,255,0.94)" }}
              />
              {poll?.deadlineAt && poll?.isActive ? (
                <PollOverlayTimer deadlineAt={poll.deadlineAt} />
              ) : poll ? (
                <Chip
                  label="Completed"
                  color="success"
                  sx={{ backgroundColor: "rgba(255,255,255,0.94)" }}
                />
              ) : null}
            </Stack>
          </Stack>

          <Box>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                height: 8,
                borderRadius: 999,
                backgroundColor: "rgba(34, 40, 49, 0.08)",
              }}
            />
          </Box>

          {isInitialLoading ? (
            <PollStageSkeleton />
          ) : !poll?.isActive ? (
            <Stack gap={2} sx={{ flex: 1 }}>
              <Card variant="outlined" sx={{ overflow: "hidden" }}>
                <CardContent>
                  <Stack gap={0.75}>
                    <Typography variant="overline" color="text.secondary">
                      Winner
                    </Typography>
                    <Typography variant="h5">
                      {winnerDish?.dishName ??
                        "No winning dish could be determined"}
                    </Typography>
                    <Typography color="text.secondary">
                      The room finished voting and this is the top pick.
                    </Typography>
                  </Stack>
                </CardContent>
                {winnerDish ? (
                  <CardMedia
                    component="img"
                    height="360"
                    image={winnerDish.imageUrl}
                    alt={winnerDish.dishName}
                  />
                ) : null}
              </Card>
              <Button variant="contained" onClick={() => navigate(-1)}>
                Back to room
              </Button>
            </Stack>
          ) : currentDish ? (
            <Stack gap={2} sx={{ flex: 1, justifyContent: "space-between" }}>
              <section className="embla" style={{ width: "100%", flex: 1 }}>
                <div
                  className="embla__viewport"
                  ref={emblaRef}
                  style={{ height: "100%" }}
                >
                  <div className="embla__container" style={{ height: "100%" }}>
                    <Card
                      className="embla__slide"
                      variant="outlined"
                      sx={{
                        overflow: "hidden",
                        minHeight: { xs: 440, md: 520 },
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={currentDish.imageUrl}
                        alt={currentDish.dishName}
                        sx={{ flex: 1, minHeight: 0, objectFit: "cover" }}
                      />
                      <CardContent sx={{ pt: 2, pb: 2.5 }}>
                        <Stack gap={0.75}>
                          <Typography variant="overline" color="text.secondary">
                            Dish {currentDish.position + 1} of{" "}
                            {pollDishes.length || 20}
                          </Typography>
                          <Typography variant="h4">
                            {currentDish.dishName}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </section>

              <Stack gap={1.25}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1">
                    Choose your reaction
                  </Typography>
                  {timer ? (
                    <Typography variant="body2" color="text.secondary">
                      {timer.label}
                    </Typography>
                  ) : null}
                </Stack>
                <Stack direction="row" gap={1}>
                  <ReactionButton
                    icon={<RefreshOutlinedIcon fontSize="small" />}
                    label="Skip"
                    color="#9c6f19"
                    onClick={() => handleReaction("skip")}
                    disabled={isRespondingToPoll}
                  />
                  <ReactionButton
                    icon={<CloseOutlinedIcon fontSize="small" />}
                    label="Nope"
                    color="#bc4749"
                    onClick={() => handleReaction("dislike")}
                    disabled={isRespondingToPoll}
                  />
                  <ReactionButton
                    icon={<ThumbUpOutlinedIcon fontSize="small" />}
                    label="Like"
                    color="#2d6a4f"
                    onClick={() => handleReaction("like")}
                    disabled={isRespondingToPoll}
                  />
                  <ReactionButton
                    icon={<FavoriteBorderOutlinedIcon fontSize="small" />}
                    label="Super"
                    color="#b83b5e"
                    onClick={() => handleReaction("superLike")}
                    disabled={isRespondingToPoll}
                  />
                </Stack>
              </Stack>
            </Stack>
          ) : isTransitionLoading ? (
            <PollStageSkeleton />
          ) : (
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ height: "100%" }}>
                <Stack gap={1.25} justifyContent="center" height="100%">
                  <Typography variant="h6">You&apos;re done</Typography>
                  <Typography color="text.secondary">
                    You have answered every available dish. We&apos;re waiting
                    for the rest of the room or the timer to finish this poll.
                  </Typography>
                  {timer ? (
                    <Chip
                      sx={{ alignSelf: "flex-start" }}
                      variant="outlined"
                      color="warning"
                      label={timer.label}
                    />
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>

        <PollBottomDrawer
          open={drawerOpen}
          onToggle={() => setDrawerOpen((current) => !current)}
          isActive={Boolean(poll?.isActive)}
          participantCount={poll?.participants.length ?? 0}
          shareMessage={shareMessage}
          actionError={actionError}
          onShareInvite={handleShareInvite}
          onFinishPoll={handleFinishPoll}
          standings={pollResults}
        />
      </Stack>
    </Container>
  );
}
