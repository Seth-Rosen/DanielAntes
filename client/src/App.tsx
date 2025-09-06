import { Switch, Route } from "wouter";
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


function App() {
  useEffect(() => {
    // Warm cache to avoid duplicate fetching on first paint (nav + page)
    storage.getPages().catch(() => {});
  }, []);

  // Development-only scroll debugging to identify late jumps
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only run in dev
    // @ts-ignore
    if (!(import.meta as any).env?.DEV) return;
    const w: any = window as any;
    if (w.__scrollDebugPatched) return;
    w.__scrollDebugPatched = true;

    const log = (...args: any[]) => console.warn('[ScrollDebug]', ...args);

    const origScrollTo = window.scrollTo.bind(window);
    // @ts-ignore
    window.scrollTo = function(...args: any[]) {
      log('window.scrollTo', args, { stack: new Error().stack });
      return origScrollTo.apply(window, args as any);
    } as any;

    const origSIV = (Element.prototype as any).scrollIntoView;
    (Element.prototype as any).scrollIntoView = function(...args: any[]) {
      log('element.scrollIntoView', this, args, { stack: new Error().stack });
      return origSIV.apply(this, args as any);
    };

    const onHash = () => log('hashchange', window.location.hash);
    window.addEventListener('hashchange', onHash);

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 2 && lastY > 100) log('scroll jumped to top', { from: lastY, to: y, t: Date.now() });
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onFocusIn = (e: Event) => log('focusin', e.target);
    window.addEventListener('focusin', onFocusIn);

    log('Scroll debug instrumentation active');

    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('focusin', onFocusIn as any);
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
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
