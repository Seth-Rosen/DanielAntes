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
