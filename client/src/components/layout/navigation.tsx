import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { Page } from "@shared/schema";

export function Navigation() {
  const [location] = useLocation();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadPages() {
      try {
        const allPages = await storage.getPages();
        const navPages = allPages
          .filter(p => p.published && p.showInNav && p.slug !== "/")
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        if (mounted) {
          setPages(prev => {
            const same = prev.length === navPages.length && prev.every((p, i) => p.id === navPages[i].id && p.slug === navPages[i].slug && p.title === navPages[i].title);
            return same ? prev : navPages;
          });
        }
      } catch (error) {
        console.error('Failed to load navigation pages:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadPages();

    const onUpdate = (e: any) => {
      if (e?.detail?.filename === 'pages.json') loadPages();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage:update', onUpdate);
    }
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage:update', onUpdate);
      }
    };
  }, []);

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-serif font-bold text-primary cursor-pointer" data-testid="site-logo">
                Daniel Antes
              </h1>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {/* Home is always first */}
              <Link href="/" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}>
                <span
                  className={`transition-colors duration-200 ${
                    location === "/"
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  data-testid="nav-link-home"
                >
                  Home
                </span>
              </Link>

              {/* Dynamic pages from storage */}
              {!isLoading && pages.map((page) => {
                const clean = page.slug === "/" ? "/" : page.slug.replace(/^\/+|\/+$/g, "");
                const pageHref = clean === "/" ? "/" : `/${clean}`;

                return (
                  <div key={page.id}>
                    {page.slug.startsWith("#") ? (
                      <button
                        onClick={() => handleNavClick(page.slug)}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                        data-testid={`nav-link-${page.slug.replace("#", "")}`}
                      >
                        {page.title}
                      </button>
                    ) : (
                      <Link href={pageHref} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}>
                        <span
                          className={`transition-colors duration-200 ${
                            location === pageHref
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                          }`}
                          data-testid={`nav-link-${page.slug}`}
                        >
                          {page.title}
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
              
              <Link href="/admin" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}>
                <Button variant="outline" size="sm" data-testid="admin-link">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="md:hidden">
            <Button variant="ghost" size="sm" data-testid="mobile-menu-button">
              <i className="fas fa-bars"></i>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
