import { HashRouter, Outlet, Route, Routes } from "react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material";

import { AppBar, BottomNavigation, BottomNavigationSkeleton } from "./nav";
import { Home, HomeSkeleton, Profile, Settings } from "./pages";
import { FastProvider } from "./context";
import { appTheme } from "./theme";

const errorBoundaryFallback = <div>Something went wrong</div>;

function AppSkeleton() {
  return (
    <Box sx={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <AppBar />
      <HomeSkeleton />
      <BottomNavigationSkeleton />
    </Box>
  );
}

function AppLayout() {
  return (
    <Box sx={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
      <AppBar />
      <Outlet />
      <BottomNavigation />
    </Box>
  );
}

export function AppInternal() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="/profile/:profileId" element={<Profile />} />
        <Route path="/settings/" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <ErrorBoundary fallback={errorBoundaryFallback}>
        <Suspense fallback={<AppSkeleton />}>
          <HashRouter>
            <FastProvider>
              <AppInternal />
            </FastProvider>
          </HashRouter>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
