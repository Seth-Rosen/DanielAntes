import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { PuckRenderer } from "@/components/puck-renderer";
import { storage } from "@/lib/storage";
import { Page } from "@shared/schema";

export default function DynamicPage() {
  const params = useParams();
  const slug = params.rest || "";
  
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadPage() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to find page by slug
        const foundPage = await storage.getPageBySlug(slug);
        
        if (foundPage && foundPage.published) {
          setPage(foundPage);
        } else {
          setError("Page not found");
        }
      } catch (err) {
        console.error('Failed to load page:', err);
        setError('Failed to load page');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPage();
  }, [slug]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !page) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-2xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The page you're looking for doesn't exist or hasn't been published yet.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Render page content using Puck CMS data
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid={`page-${slug}`}>
      <Navigation />
      <PuckRenderer data={page.data} />
      <Footer />
    </div>
  );
}