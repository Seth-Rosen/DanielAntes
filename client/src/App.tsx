import { Switch, Route, useLocation } from "wouter";
import { useEffect, useLayoutEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import Builder from "@/pages/builder";
import DynamicPage from "@/pages/dynamic-page";
import { storage } from "@/lib/storage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/builder/:pageId?" component={Builder} />
      <Route path="/:rest*" component={DynamicPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTopOnRouteChange() {
  const [location] = useLocation();
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) return; // allow hash logic to handle
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location]);
  return null;
}

let __handledInitialHash = false;

function App() {
  useEffect(() => {
    // Warm cache to avoid duplicate fetching on first paint (nav + page)
    storage.getPages().catch(() => {});
  }, []);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (__handledInitialHash) return;
    __handledInitialHash = true;

    const { hash, pathname, search } = window.location;
    if (!hash) return;

    // Clear the hash immediately to prevent any delayed native jumps
    window.history.replaceState({}, '', pathname + search);

    // One-shot attempt to scroll to target if it already exists; no retries
    const el = document.querySelector(hash) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <ScrollToTopOnRouteChange />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
