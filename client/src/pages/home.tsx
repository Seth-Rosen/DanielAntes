import { useState, useEffect, useLayoutEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { PuckRenderer } from "@/components/puck-renderer";
import { storage } from "@/lib/storage";
import { Page } from "@shared/schema";

export default function Home() {
  // Fetch homepage content from static storage
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadPage() {
      try {
        setIsLoading(true);
        const homePage = await storage.getPageBySlug("/");
        setPage(homePage);
      } catch (err) {
        console.error('Failed to load homepage:', err);
        setError('Failed to load page');
      } finally {
        setIsLoading(false);
      }
    }
    loadPage();
  }, []);


  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-muted-foreground">Loading homepage...</div>
        </div>
      </div>
    );
  }

  // Error state - fallback to basic content
  if (error || !page) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-serif font-bold mb-4">Welcome to Daniel Antes</h1>
            <p className="text-muted-foreground mb-6">
              Master artisan specializing in marquetry and hardwood flooring with three decades of expertise.
            </p>
            <p className="text-sm text-muted-foreground">
              {error ? "Unable to load page content. Please try again later." : "Homepage content not found."}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render page content using Puck CMS data
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="home-page">
      <Navigation />
      <PuckRenderer data={page.data} />
      <Footer />
    </div>
  );
}
