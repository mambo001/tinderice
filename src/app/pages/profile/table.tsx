import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import { Button, Snackbar } from "@mui/material";
import {
  format,
  formatDistanceStrict,
  formatDistanceToNowStrict,
} from "date-fns";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import { useFastContext } from "../../context";
import type { Session } from "../../../types";
import { db } from "../../../dexie/db";

export const sessionFields = [
  "id",
  "window",
  "startedAt",
  "endedAt",
] as const satisfies ReadonlyArray<keyof Session>;

const renderFormattedDate = (date: Date | null) => {
  return date ? format(new Date(date), "MMM, dd h:mm aa") : "";
};

const camelCaseToTitleCase = (str: string) => {
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export function FastingSessionsTable() {
  const { sessions } = useFastContext();
  const [isDeletedToastOpen, setIsDeletedToastOpen] = useState(false);
  const [lastDeletedSession, setLastDeletedSession] = useState<string | null>(
    null,
  );

  useEffect(() => {
    db.sessions
      .filter((session) => session.isArchived)
      .modify({ isArchived: false });
  }, []);

  const renderTableHeadRows = () => {
    if (sessions.length === 0) return null;

    const [_, ...remainingKeys] = sessionFields;
    return remainingKeys
      .map((key) => {
        if (key === "window")
          return (
            <TableCell
              sx={{
                maxWidth: 55,
              }}
              size="small"
              key={key}
            >
              Goal
            </TableCell>
          );

        return <TableCell key={key}>{camelCaseToTitleCase(key)}</TableCell>;
      })
      .concat([
        <TableCell key="duration">Duration</TableCell>,
        <TableCell key="action">Action</TableCell>,
      ]);
  };

  const renderTableBodyRows = () => {
    return (
      sessions.length > 0 &&
      sessions.map((session) => (
        <TableRow key={session.id}>
          <TableCell>{session.window}</TableCell>
          <TableCell>{renderFormattedDate(session.startedAt)}</TableCell>
          <TableCell>{renderFormattedDate(session.endedAt)}</TableCell>
          <TableCell>
            {session.startedAt &&
              session.endedAt === null &&
              formatDistanceToNowStrict(new Date(session.startedAt))}
            {session.startedAt && session.endedAt
              ? formatDistanceStrict(
                  new Date(session.startedAt),
                  new Date(session.endedAt),
                )
              : ""}
          </TableCell>
          <TableCell>
            <IconButton onClick={() => handleDeleteClick(session.id)}>
              <DeleteOutlineOutlinedIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))
    );
  };

  const handleDeleteClick = (id: string) => {
    const sessionToArchive = sessions.find((session) => session.id === id);
    console.log({ sessionToArchive });
    db.sessions.update(id, {
      isArchived: true,
    });
    setLastDeletedSession(id);
    setIsDeletedToastOpen(true);
  };

  const handleUndoDeleteClick = () => {
    if (!lastDeletedSession) return;
    db.sessions.update(lastDeletedSession, {
      isArchived: false,
    });
    setLastDeletedSession(null);
    setIsDeletedToastOpen(false);
  };

  const handleDeletedToastClose = () => {
    setIsDeletedToastOpen(false);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ maxHeight: "70svh" }}
      >
        <Table>
          <TableHead>
            <TableRow>{renderTableHeadRows()}</TableRow>
          </TableHead>
          <TableBody>{renderTableBodyRows()}</TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={isDeletedToastOpen}
        autoHideDuration={10_000}
        onClose={handleDeletedToastClose}
        message={"Session archived"}
        action={
          <>
            <Button
              color="secondary"
              size="small"
              onClick={handleUndoDeleteClick}
            >
              UNDO
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleDeletedToastClose}
            >
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </>
        }
      />
    </>
  );
}
