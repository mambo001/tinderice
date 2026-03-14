import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  colors,
  Container,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import type {
  EmblaOptionsType,
  EmblaCarouselType,
  EmblaEventType,
} from "embla-carousel";
import ClassNames from "embla-carousel-class-names";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface Meal {
  strMeal: string;
  strMealThumb: string;
  idMeal: string;
}

interface Dish {
  name: string;
  imageUrl: string;
  id: string;
}

const useMeals = () =>
  useQuery({
    queryKey: ["todos"],
    queryFn: () =>
      fetch("https://www.themealdb.com/api/json/v1/1/filter.php?a=Filipino")
        .then((res) => res.json())
        .then((data) =>
          (data.meals as Meal[]).map(
            (meal) =>
              ({
                name: meal.strMeal,
                imageUrl: meal.strMealThumb,
                id: meal.idMeal,
              }) as Dish,
          ),
        ),
  });

type PropType = {
  slides: Dish[];
  options?: EmblaOptionsType;
};

const OPTIONS: EmblaOptionsType = { loop: true };

function EmblaCarousel(props: PropType) {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [ClassNames()]);

  const logSlidesInView = (
    emblaApi: EmblaCarouselType,
    event: EmblaEventType,
  ) => {
    // console.log(`${event}: ${event.detail.slidesInView}`);
    console.log(`emblaApi: ${emblaApi}`);
    console.log(`event: ${event}`);
  };

  useEffect(() => {
    if (!emblaApi) return;
    // emblaApi.on("slidesinview", logSlidesInView);
    emblaApi.on("slidesInView", logSlidesInView);
  }, [emblaApi]);

  return (
    <section
      style={{
        width: "100%",
      }}
      className="embla"
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((dish) => (
            <Card
              className="embla__slide"
              sx={{
                // height: "70svh",
                pb: 4,
              }}
              key={dish.id}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="300"
                  image={dish.imageUrl}
                  alt={dish.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {dish.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                    Architecto, tempora recusandae atque necessitatibus iusto
                    sunt nisi dolorum fuga eligendi voluptates.
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Stack
                  flex={1}
                  direction={"row"}
                  justifyContent={"center"}
                  gap={4}
                >
                  <IconButton size="large">
                    <RefreshOutlinedIcon sx={{ color: colors.yellow[600] }} />
                  </IconButton>
                  <IconButton size="large" color="error">
                    <CloseOutlinedIcon />
                  </IconButton>
                  <IconButton size="large" sx={{ color: colors.green[600] }}>
                    <ThumbUpOutlinedIcon />
                  </IconButton>
                  <IconButton size="large" sx={{ color: colors.pink[600] }}>
                    <FavoriteBorderOutlinedIcon />
                  </IconButton>
                </Stack>
              </CardActions>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmblaCarouselSkeleton() {
  return (
    <Card
      className="embla__slide"
      sx={{
        pb: 4,
      }}
    >
      <Skeleton variant="rectangular" width="100" height={300} />
      <CardContent>
        <Skeleton
          variant="text"
          width={200}
          sx={{
            fontSize: "2.5rem",
          }}
        />
        <Skeleton
          variant="text"
          width={"100%"}
          sx={{
            fontSize: "1.5rem",
          }}
        />
        <Skeleton
          variant="text"
          width={"100%"}
          sx={{
            fontSize: "1.5rem",
          }}
        />
        <Skeleton
          variant="text"
          width={250}
          sx={{
            fontSize: "1.5rem",
          }}
        />
      </CardContent>
      <CardActions>
        <Stack flex={1} direction={"row"} justifyContent={"center"} gap={4}>
          <Skeleton variant="rectangular" width={45} height={45} />
          <Skeleton variant="rectangular" width={45} height={45} />
          <Skeleton variant="rectangular" width={45} height={45} />
          <Skeleton variant="rectangular" width={45} height={45} />
        </Stack>
      </CardActions>
    </Card>
  );
}

export function Room() {
  const navigate = useNavigate();
  const { roomId = "" } = useParams<{
    roomId: string;
  }>();

  const handleBackClick = () => {
    navigate(-1);
  };

  const meals = useMeals();

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
      {/* <Stack marginTop={6} paddingBottom={4} gap={2}> */}
      <Stack paddingBottom={4} gap={2}>
        <Stack gap={1} alignItems={"flex-start"}>
          <Button
            variant="text"
            onClick={handleBackClick}
            startIcon={<KeyboardBackspaceOutlinedIcon />}
          >
            Back
          </Button>
          <Typography variant="body1" fontWeight={500}>
            Room ID: {roomId}
          </Typography>
        </Stack>
        {meals.data ? (
          <EmblaCarousel slides={meals.data} options={OPTIONS} />
        ) : (
          <EmblaCarouselSkeleton />
        )}
      </Stack>
    </Container>
  );
}
