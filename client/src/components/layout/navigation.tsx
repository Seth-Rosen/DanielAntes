import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "#story", label: "My Story" },
    { href: "#press", label: "Press" },
    { href: "#awards", label: "Awards" },
    { href: "#resources", label: "Industry Resources" },
    { href: "#contact", label: "Contact" },
  ];

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
              {navItems.map((item) => (
                <div key={item.href}>
                  {item.href.startsWith("#") ? (
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                      data-testid={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link href={item.href}>
                      <span
                        className={`transition-colors duration-200 ${
                          location === item.href
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary"
                        }`}
                        data-testid={`nav-link-${item.label.toLowerCase().replace(" ", "-")}`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  )}
                </div>
              ))}
              
              <Link href="/admin">
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
