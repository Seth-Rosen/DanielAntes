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

  // Global guard: prevent unexpected programmatic jump-to-top shortly after route/content changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w: any = window as any;
    w.__enableScrollGuard = () => {
      w.__scrollGuardActiveUntil = Date.now() + 2000;
      w.__scrollGuardUser = false;
    };

    const markUser = () => { const ww: any = window as any; ww.__scrollGuardUser = true; };
    window.addEventListener('wheel', markUser, { passive: true });
    window.addEventListener('touchmove', markUser, { passive: true });
    window.addEventListener('keydown', markUser as any, { passive: true } as any);

    let lastY = window.scrollY;
    const restoreIfBad = () => {
      const guardActive = (w.__scrollGuardActiveUntil || 0) > Date.now();
      if (!guardActive) { lastY = window.scrollY; return; }
      // If a non-user jump moved us to top, restore previous position
      if (!w.__scrollGuardUser && window.scrollY === 0 && lastY > 120) {
        requestAnimationFrame(() => window.scrollTo({ top: lastY, left: 0, behavior: 'auto' }));
      } else {
        lastY = window.scrollY;
      }
    };
    window.addEventListener('scroll', restoreIfBad, { passive: true });

    return () => {
      window.removeEventListener('scroll', restoreIfBad as any);
      window.removeEventListener('wheel', markUser as any);
      window.removeEventListener('touchmove', markUser as any);
      window.removeEventListener('keydown', markUser as any);
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
