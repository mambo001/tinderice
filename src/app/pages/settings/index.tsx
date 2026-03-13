import {
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";

import { SettingsList } from "./list";
import { db } from "../../../dexie/db";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0] ?? {});
  const escape = (value: unknown) => {
    const str = value === null || value === undefined ? "" : String(value);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ];
  return lines.join("\n");
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function Settings() {
  const handleExportClick = async () => {
    try {
      const date = new Date().toISOString().slice(0, 10);

      for (const table of db.tables) {
        const rows = await table.toArray();
        if (rows.length === 0) continue;
        const csv = toCsv(rows);
        downloadFile(csv, `fastrack-${table.name}-${date}.csv`);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
    }
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
      <Stack marginTop={6} paddingBottom={4} gap={2}>
        <Typography variant="h5">Settings</Typography>
        <Stack gap={1}>
          <Typography variant="body1" fontWeight={500}>
            Appearance
          </Typography>
          <SettingsList />
        </Stack>
        <Stack gap={1}>
          <Typography variant="body1" fontWeight={500}>
            Data
          </Typography>
          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            <ListItem>
              <ListItemText primary="Import" />
              <IconButton disabled>
                <ArrowForwardIosOutlinedIcon />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemText primary="Export" />
              <IconButton onClick={handleExportClick}>
                <ArrowForwardIosOutlinedIcon />
              </IconButton>
            </ListItem>
            <ListItem>
              <ListItemText primary="Back up" />
              <IconButton disabled>
                <ArrowForwardIosOutlinedIcon />
              </IconButton>
            </ListItem>
          </List>
        </Stack>
      </Stack>
    </Container>
  );
}
