import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Box,
  Container,
  Stack,
  Typography,
  Skeleton,
  CardActionArea,
} from "@mui/material";
import { type PropsWithChildren } from "react";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import { useNavigate } from "react-router";

import { useIdentityContext } from "@/app/context/identity";

const rooms = [
  {
    id: "1",
    name: "Room 1",
  },
  {
    id: "1",
    name: "Room 2",
  },
  {
    id: "1",
    name: "Room 3",
  },
];

export function Home() {
  const navigate = useNavigate();
  const { identity } = useIdentityContext();

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <HomeLayout>
      <Typography variant="h5">
        Welcome, {identity ? identity.name : `<someone>`}
      </Typography>
      <Typography>Quick Actions</Typography>
      <Stack gap={1}>
        <Card>
          <CardActionArea onClick={() => console.log("")}>
            <CardContent>
              <Stack justifyContent={"space-between"} direction={"row"}>
                <Typography>Start Instant Poll</Typography>
                <ChevronRightOutlinedIcon />
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card>
          <CardActionArea onClick={() => console.log("")}>
            <CardContent>
              <Stack justifyContent={"space-between"} direction={"row"}>
                <Typography>Create Room</Typography>
                <ChevronRightOutlinedIcon />
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      </Stack>
      <Typography>Active Polls</Typography>
      <Stack gap={1}>
        <Card>
          <CardActionArea onClick={() => console.log("")}>
            <CardContent>
              <Stack justifyContent={"space-between"} direction={"row"}>
                <Typography>{`<VOTING_TITLE>-<CATEGORY>`}</Typography>
                <ChevronRightOutlinedIcon />
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      </Stack>
      <Typography>Recently Joined Rooms</Typography>
      <Stack gap={1}>
        {rooms.map((room) => (
          <Card key={room.name}>
            <CardActionArea onClick={() => handleRoomClick(room.id)}>
              <CardContent>
                <Stack justifyContent={"space-between"} direction={"row"}>
                  <Typography>{room.name}</Typography>
                  <ChevronRightOutlinedIcon />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
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
      <Stack marginTop={6} paddingBottom={8} gap={2}>
        {props.children}
      </Stack>
    </Container>
  );
}
