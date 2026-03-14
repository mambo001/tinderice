import * as React from "react";
import {
  AppBar as MUIAppBar,
  Toolbar,
  Typography,
  CssBaseline,
  useScrollTrigger,
  Container,
  Slide,
  IconButton,
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useNavigate } from "react-router";

interface Props {
  window?: () => Window;
  children?: React.ReactElement<unknown>;
}

function HideOnScroll(props: Props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}

export function AppBar(props: React.PropsWithChildren) {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <HideOnScroll {...props}>
        <MUIAppBar>
          <Toolbar variant="dense">
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
              }}
            >
              tinderice
            </Typography>
            <IconButton onClick={handleSettingsClick} color="inherit">
              <SettingsOutlinedIcon />
            </IconButton>
          </Toolbar>
        </MUIAppBar>
      </HideOnScroll>
      <Toolbar />
      <Container>{props.children}</Container>
    </React.Fragment>
  );
}
