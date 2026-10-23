import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CustomCursor } from "@/components/CustomCursor";
import { AppSettingsProvider } from "@/hooks/use-app-settings";

const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/Home"));
const TouristSpots = lazy(() => import("@/pages/TouristSpots"));
const Restaurants = lazy(() => import("@/pages/Restaurants"));
const Helpline = lazy(() => import("@/pages/Helpline"));
const Chat = lazy(() => import("@/pages/Chat"));
const Login = lazy(() => import("@/pages/Login"));

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-primary">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/spots" component={TouristSpots} />
      <Route path="/restaurants" component={Restaurants} />
      <Route path="/helpline" component={Helpline} />
      <Route path="/chat" component={Chat} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppSettingsProvider>
          <CustomCursor />
          <Toaster />
          <Suspense fallback={<PageLoading />}>
            <Router />
          </Suspense>
        </AppSettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
