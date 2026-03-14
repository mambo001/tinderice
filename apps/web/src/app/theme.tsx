import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          default: "#EEEEEE",
        },
        primary: {
          main: "#222831",
        },
        secondary: {
          main: "#393E46",
        },
        info: {
          main: "#00ADB5",
        },
        error: {
          main: "#bc4749ff",
        },
        warning: {
          main: "#f2e8cfff",
        },
      },
    },
    dark: {
      palette: {
        background: {
          paper: "#071010",
        },
        primary: {
          main: "#9EC8B9",
        },
        secondary: {
          main: "#5C8374",
        },
        info: {
          main: "#9ACBD0ff",
        },
        error: {
          main: "#bc4749ff",
        },
        warning: {
          main: "#f2e8cfff",
        },
      },
    },
  },
});
