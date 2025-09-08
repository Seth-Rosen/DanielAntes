import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();

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
              <Link href="/">
                <span
                  className={`transition-colors duration-200 ${
                    location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  data-testid="nav-link-home"
                >
                  Home
                </span>
              </Link>
              <button onClick={() => handleNavClick('#story')} className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="nav-link-story">My Story</button>
              <button onClick={() => handleNavClick('#gallery')} className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="nav-link-gallery">Gallery</button>
              <button onClick={() => handleNavClick('#contact')} className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="nav-link-contact">Contact</button>
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
