export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 px-4 sm:px-6 lg:px-8" data-testid="site-footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-primary mb-4" data-testid="footer-title">
              Daniel Antes
            </h3>
            <p className="text-muted-foreground mb-4" data-testid="footer-description">
              Master artisan specializing in bespoke marquetry and hardwood flooring with over 30 years of experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-instagram">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-linkedin">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="social-email">
                <i className="fas fa-envelope text-xl"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4" data-testid="services-heading">Services</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="service-parquet">Parquet Flooring</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="service-medallion">Medallion Design</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="service-mandala">Mandala Installation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors" data-testid="service-restoration">Restoration</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4" data-testid="company-heading">Company</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#story" className="hover:text-primary transition-colors" data-testid="footer-story">My Story</a></li>
              <li><a href="#gallery" className="hover:text-primary transition-colors" data-testid="footer-portfolio">Portfolio</a></li>
              <li><a href="#press" className="hover:text-primary transition-colors" data-testid="footer-press">Press</a></li>
              <li><a href="#awards" className="hover:text-primary transition-colors" data-testid="footer-awards">Awards</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p data-testid="copyright-notice">&copy; 2025 Daniel Antes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
