import * as React from "react";
import MUIBottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RoomServiceOutlinedIcon from "@mui/icons-material/RoomServiceOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useNavigate, useLocation, useParams } from "react-router";
import { Paper, Skeleton } from "@mui/material";

import { getLastVisitedRoomId } from "@/utils/room-navigation";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: <HomeOutlinedIcon />, show: true },
  {
    label: "Room",
    path: "/room",
    icon: <RoomServiceOutlinedIcon />,
    show: true,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: <SettingsOutlinedIcon />,
    show: false,
  },
] as const;

function getNavIndex(pathname: string): number {
  const index = NAV_ITEMS.findIndex((item) =>
    item.path === "/" ? pathname === "/" : pathname.startsWith(item.path),
  );
  return index === -1 ? 0 : index;
}

export function BottomNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { roomId = "" } = useParams<{ roomId: string }>();

  const value = getNavIndex(pathname);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    const item = NAV_ITEMS[newValue];
    if (!item) return;

    const lastVisitedRoomId = roomId || getLastVisitedRoomId();
    const path =
      item.path === "/room" && lastVisitedRoomId
        ? `/room/${lastVisitedRoomId}`
        : item.path;

    navigate(path);
  };

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <MUIBottomNavigation showLabels value={value} onChange={handleChange}>
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            sx={{
              display: item.show ? "flex" : "none",
            }}
          />
        ))}
      </MUIBottomNavigation>
    </Paper>
  );
}

export function BottomNavigationSkeleton() {
  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <MUIBottomNavigation showLabels>
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.path}
            disabled
            label={
              <Skeleton variant="text" sx={{ fontSize: "1rem" }} width={50} />
            }
            icon={<Skeleton variant="circular" width={36} height={36} />}
          />
        ))}
      </MUIBottomNavigation>
    </Paper>
  );
}
