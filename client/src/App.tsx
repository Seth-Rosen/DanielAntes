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
    let lastY = window.scrollY;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const unlock = () => {
      if (unlocked) return;
      unlocked = true;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (!unlocked && y === 0 && lastY > 100) {
        window.scrollTo({ top: lastY, left: 0, behavior: 'auto' });
        unlock();
      } else {
        lastY = y;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const timer = setTimeout(unlock, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll as any);
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
