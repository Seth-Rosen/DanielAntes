import { Button } from "@/components/ui/button";

export function Navigation() {
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
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector('#home');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F7a49fb9e5a3e44f68aecac27eea3cb74%2Face3d3af6f704e60afd7ecc1e12eb2af?format=webp&width=800"
                alt="Daniel Antes logo"
                className="h-10 w-auto object-contain"
                data-testid="site-logo"
              />
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => handleNavClick('#home')}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                data-testid="nav-link-home"
              >
                Home
              </button>
              <button onClick={() => handleNavClick('#story')} className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="nav-link-story">My Story</button>
              <button onClick={() => handleNavClick('#gallery')} className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="nav-link-gallery">Gallery</button>
              <button onClick={() => handleNavClick('#contact')} className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="nav-link-contact">Contact</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
