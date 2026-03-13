import { Button, Container, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";

import type { EmblaOptionsType } from "embla-carousel";
import ClassNames from "embla-carousel-class-names";
import useEmblaCarousel from "embla-carousel-react";

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
};

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

const EmblaCarousel = (props: PropType) => {
  const { slides, options } = props;
  const [emblaRef] = useEmblaCarousel(options, [ClassNames()]);

  return (
    <section
      style={{
        backgroundColor: "red",
        width: "100%",
      }}
      className="embla"
    >
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((index) => (
            <div
              className="embla__slide"
              style={{
                height: "70svh",
              }}
              key={index}
            >
              <div className="embla__slide__number">{index + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export function Room() {
  const navigate = useNavigate();
  const { roomId = "" } = useParams<{
    roomId: string;
  }>();

  const handleBackClick = () => {
    navigate(-1);
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
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </Stack>
    </Container>
  );
}
