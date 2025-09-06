import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { PuckRenderer } from "@/components/puck-renderer";
import { storage } from "@/lib/storage";
import { Page } from "@shared/schema";

export default function DynamicPage() {
  const [location] = useLocation();
  const normalize = (s: string) => {
    if (!s) return s;
    const decoded = decodeURIComponent(s);
    if (decoded === "/") return "/";
    return decoded.replace(/^\/+|\/+$/g, "");
  };
  const slug = normalize(location === "/" ? "/" : (location || "").replace(/^\/+/, ""));

  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    async function loadPage() {
      try {
        if (mounted) {
          setIsLoading(true);
          setError(null);
        }
        // Primary: resolve via storage helper (case-insensitive, trims slashes, title fallback)
        let found = await storage.getPageBySlug(slug);

        // Secondary: bypass any caching and read raw JSON, then resolve again
        if (!found) {
          try {
            const r = await fetch(`/data/pages.json?t=${Date.now()}`);
            if (r.ok) {
              const all = await r.json();
              const norm = (s: string) => (s === '/' ? '/' : (s || '').replace(/^\/+|\/+$/g, '').toLowerCase());
              const slugify = (s: string) => (s || '').toLowerCase().trim().replace(/[^a-z0-9\s-/]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^\/+|\/+$/g, '');
              const target = norm(slug);
              found = (all as any[]).find((p: any) => norm(p.slug) === target || slugify(p.title) === target) || null;
            }
          } catch {}
        }

        if (mounted) {
          if (found && (found.published ?? true)) {
            setPage(found);
          } else {
            setPage(null);
            setError('Page not found');
          }
        }
      } catch (err) {
        console.error('Failed to load page:', err);
        if (mounted) setError('Failed to load page');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadPage();

    const onUpdate = (e: any) => {
      if (e?.detail?.filename === 'pages.json') {
        loadPage();
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage:update', onUpdate);
    return () => { mounted = false; if (typeof window !== 'undefined') window.removeEventListener('storage:update', onUpdate); };
  }, [slug]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isLoading) {
      const w: any = window as any;
      if (w.__pendingScrollToTop) {
        if (!w.__userScrolledSinceRouteChange) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        }
        w.__pendingScrollToTop = false;
        w.__routeChangeAt = 0;
        w.__userScrolledSinceRouteChange = false;
      }
    }
  }, [isLoading]);

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
