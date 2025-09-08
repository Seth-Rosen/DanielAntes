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

function ScrollLockUntilJump() {
  const [location] = useLocation();
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unlocked = false;

    // Force to top immediately on navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Block user input while locked to avoid visual fight
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener('wheel', prevent, { passive: false });
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('keydown', prevent as any, { passive: false } as any);

    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener('wheel', prevent as any);
      window.removeEventListener('touchmove', prevent as any);
      window.removeEventListener('keydown', prevent as any);
    };

    const timer = setTimeout(unlock, 1600);

    return () => {
      clearTimeout(timer);
      unlock();
    };
  }, [location]);
  return null;
}

function App() {
  useEffect(() => {
    // Warm cache to avoid duplicate fetching on first paint (nav + page)
    storage.getPages().catch(() => {});
  }, []);





  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <ScrollLockUntilJump />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
