import { Switch, Route } from "wouter";
import { useEffect } from "react";
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

let __handledInitialHash = false;

function App() {
  useEffect(() => {
    // Warm cache to avoid duplicate fetching on first paint (nav + page)
    storage.getPages().catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (__handledInitialHash) return;
    __handledInitialHash = true;

    const { hash, pathname, search } = window.location;
    if (!hash) return;

    let userScrolled = false;
    const onUserScroll = () => {
      userScrolled = true;
      window.removeEventListener('scroll', onUserScroll);
    };
    window.addEventListener('scroll', onUserScroll, { passive: true });

    const start = performance.now();
    const tryScroll = () => {
      if (userScrolled) return; // don't override user intent
      const el = document.querySelector(hash);
      if (el) {
        (el as HTMLElement).scrollIntoView({ behavior: 'auto', block: 'start' });
        window.history.replaceState({}, '', pathname + search);
        window.removeEventListener('scroll', onUserScroll);
        return;
      }
      if (performance.now() - start < 3000) {
        requestAnimationFrame(tryScroll);
      } else {
        // Element never appeared within timeout; clear hash to prevent late jumps
        window.history.replaceState({}, '', pathname + search);
        window.removeEventListener('scroll', onUserScroll);
      }
    };

    tryScroll();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
