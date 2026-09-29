import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({ default: module.HomePage }))
);
const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage").then((module) => ({ default: module.AnalyticsPage }))
);
const DataPage = lazy(() => import("./pages/DataPage"));
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage }))
);

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-[#628141]">
      Loading…
    </div>
  );
}

const page = (element: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: "/", element: page(<LoginPage />) },
  {
    path: "/admin-home",
    element: page(
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: page(<HomePage />) },
      { path: "analytics", element: page(<AnalyticsPage />) },
      { path: "data", element: page(<DataPage />) },
      { path: "settings", element: page(<SettingsPage />) },
    ],
  },
]);
