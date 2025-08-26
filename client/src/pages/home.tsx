import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["/api/images"],
    queryFn: () => api.getImages(),
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => api.getProjects(),
  });

  const slideshowImages = images.filter((img: any) => img.slideshow);
  const featuredProjects = projects.filter((project: any) => project.featured).slice(0, 4);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleTypeClick = (tag: string) => {
    setLocation(`/portfolio?filter=${tag}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Hero Section */}
      <section 
        id="home" 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Background slideshow */}
        <div className="absolute inset-0 z-0">
          {slideshowImages.length > 0 ? (
            <img 
              src={`/uploads/${slideshowImages[0]?.filename}`}
              alt="Portfolio slideshow" 
              className="w-full h-full object-cover fade-animation" 
              data-testid="hero-background-image"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary to-muted" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        
        <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white" data-testid="hero-title">
            Master Artisan<br />
            <span className="text-primary">Marquetry & Flooring</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto" data-testid="hero-description">
            Crafting bespoke hardwood floors and intricate marquetry with three decades of artistic excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold hover-lift" 
              onClick={() => setLocation("/portfolio")}
              data-testid="button-view-portfolio"
            >
              View Portfolio
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-background px-8 py-3 font-semibold" 
              onClick={() => handleScrollToSection("#contact")}
              data-testid="button-get-in-touch"
            >
              Get In Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Types of Work Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card" data-testid="types-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="types-title">
              Types of Marquetry
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="types-description">
              Each style represents decades of refined technique and artistic vision, 
              creating floors that are both functional masterpieces and works of art.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["parquet", "medallion", "mandala"].map((type) => (
              <Card 
                key={type}
                className="type-button rounded-xl overflow-hidden hover-lift cursor-pointer group bg-gradient-to-br from-card to-secondary border-none" 
                onClick={() => handleTypeClick(type)}
                data-testid={`type-button-${type}`}
              >
                <div className="relative h-80">
                  <div className="absolute inset-0 image-overlay"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-3xl font-serif font-bold mb-2 capitalize" data-testid={`type-title-${type}`}>
                        {type}
                      </h3>
                      <p className="text-lg opacity-90" data-testid={`type-subtitle-${type}`}>
                        {type === "parquet" && "Classic geometric patterns"}
                        {type === "medallion" && "Circular masterpieces"}
                        {type === "mandala" && "Spiritual symmetry"}
                      </p>
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="inline-flex items-center text-sm">
                          Explore Collection <i className="fas fa-arrow-right ml-2"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Carousel */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="featured-projects-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="featured-projects-title">
                Featured Projects
              </h2>
              <p className="text-xl text-muted-foreground" data-testid="featured-projects-description">
                Recent masterpieces showcasing artistic excellence
              </p>
            </div>
          </div>
          
          {projectsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading projects...</div>
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="flex space-x-6 overflow-x-auto carousel-container pb-4" data-testid="featured-projects-carousel">
              {featuredProjects.map((project: any) => (
                <Card 
                  key={project.id} 
                  className="flex-none w-80 bg-card hover-lift cursor-pointer border-none" 
                  onClick={() => setLocation(`/portfolio?project=${project.id}`)}
                  data-testid={`project-card-${project.id}`}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold mb-2" data-testid={`project-title-${project.id}`}>
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-4" data-testid={`project-description-${project.id}`}>
                      {project.description}
                    </p>
                    <div className="flex items-center text-primary text-sm">
                      <span>View Project</span>
                      <i className="fas fa-arrow-right ml-2"></i>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12" data-testid="no-featured-projects">
              No featured projects available yet.
            </div>
          )}
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="story-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="story-title">
                My Story
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p data-testid="story-paragraph-1">
                  For over three decades, I've dedicated my life to the ancient art of marquetry and 
                  the precise craft of hardwood flooring. What began as an apprenticeship under master 
                  craftsmen in traditional European workshops has evolved into a passion for creating 
                  floors that are both functional and artistic.
                </p>
                <p data-testid="story-paragraph-2">
                  Each project represents a unique collaboration between client vision and artisan expertise. 
                  I believe that a floor should tell a story—whether through the sacred geometry of a mandala, 
                  the classical elegance of parquet, or the focal drama of a hand-crafted medallion.
                </p>
                <p data-testid="story-paragraph-3">
                  My commitment extends beyond individual projects to preserving these time-honored techniques 
                  for future generations, mentoring young craftspeople and contributing to industry resources 
                  that advance the field.
                </p>
              </div>
              <div className="mt-8">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-semibold" 
                  onClick={() => handleScrollToSection("#contact")}
                  data-testid="button-start-project"
                >
                  Start Your Project
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 bg-muted rounded-xl shadow-2xl flex items-center justify-center text-muted-foreground">
                Master craftsman portrait placeholder
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold" data-testid="experience-years">30+</div>
                  <div className="text-sm font-semibold" data-testid="experience-label">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted" data-testid="contact-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="contact-title">
              Start Your Project
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="contact-description">
              Ready to create a masterpiece that will define your space for generations? 
              Let's discuss your vision and bring it to life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-serif font-semibold mb-6" data-testid="contact-info-title">
                Get In Touch
              </h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div>
                    <div className="font-semibold" data-testid="contact-phone-label">Phone</div>
                    <div className="text-muted-foreground" data-testid="contact-phone">+1 (555) 123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <div className="font-semibold" data-testid="contact-email-label">Email</div>
                    <div className="text-muted-foreground" data-testid="contact-email">daniel@marquetrymaster.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground p-3 rounded-full">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <div className="font-semibold" data-testid="contact-studio-label">Studio</div>
                    <div className="text-muted-foreground" data-testid="contact-studio">Available for on-site consultations</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="bg-background p-8 border-none">
              <form className="space-y-6" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-ring focus:border-transparent" 
                      placeholder="Your Name"
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-ring focus:border-transparent" 
                      placeholder="your.email@example.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="project-type" className="block text-sm font-semibold mb-2">Project Type</label>
                  <select 
                    id="project-type" 
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-ring focus:border-transparent"
                    data-testid="select-project-type"
                  >
                    <option value="">Select project type...</option>
                    <option value="parquet">Parquet Flooring</option>
                    <option value="medallion">Medallion Installation</option>
                    <option value="mandala">Mandala Design</option>
                    <option value="restoration">Restoration Project</option>
                    <option value="custom">Custom Design</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">Project Details</label>
                  <textarea 
                    id="message" 
                    rows={6} 
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-ring focus:border-transparent" 
                    placeholder="Tell us about your project vision, space dimensions, timeline, and any specific requirements..."
                    data-testid="textarea-message"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 font-semibold hover-lift"
                  data-testid="button-submit-inquiry"
                >
                  Send Project Inquiry
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
