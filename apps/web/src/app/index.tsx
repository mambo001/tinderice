import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material";

import { AppBar, BottomNavigation, BottomNavigationSkeleton } from "./nav";
import { Home, HomeSkeleton, Room, Settings } from "./pages";
import { FastProvider } from "./context/fast";
import { appTheme } from "./theme";
import { IdentityContextProvider } from "./context/identity";

const queryClient = new QueryClient();

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
        <Route path="/room/:roomId" index element={<Room />} />
        <Route path="/settings/" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={errorBoundaryFallback}>
          <Suspense fallback={<AppSkeleton />}>
            <IdentityContextProvider>
              <HashRouter>
                <FastProvider>
                  <AppInternal />
                </FastProvider>
              </HashRouter>
            </IdentityContextProvider>
          </Suspense>
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
