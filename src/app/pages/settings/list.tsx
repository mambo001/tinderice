import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { SettingsThemeSplitButton } from "./theme-spllit-button";

export function SettingsList() {
  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      <ListItem>
        <ListItemText primary="Theme" />
        <SettingsThemeSplitButton />
      </ListItem>
    </List>
  );
}
