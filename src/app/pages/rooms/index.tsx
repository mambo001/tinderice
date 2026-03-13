import { Container, Stack, Typography } from "@mui/material";

export function Room() {
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
      <Stack marginTop={6} paddingBottom={4} gap={2}>
        <Typography variant="body1" fontWeight={500}>
          Recent sessions
        </Typography>
      </Stack>
    </Container>
  );
}
