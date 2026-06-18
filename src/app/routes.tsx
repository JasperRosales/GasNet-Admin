import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./pages/HomePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import DataPage from "./pages/DataPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/admin-home",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "data", element: <DataPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
