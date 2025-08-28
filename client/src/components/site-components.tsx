import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { storage } from "@/lib/storage";
import { useLocation } from "wouter";
import { Image, Project } from "@shared/schema";

// HeroSection Component
export const HeroSection = ({ title, subtitle, backgroundImage, ctaPrimary, ctaSecondary }: {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  ctaPrimary: string;
  ctaSecondary: string;
}) => {
  const [, setLocation] = useLocation();

  const [images, setImages] = useState<Image[]>([]);
  
  useEffect(() => {
    async function loadImages() {
      try {
        const allImages = await storage.getImages();
        setImages(allImages.filter(img => img.slideshow));
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    }
    loadImages();
  }, []);

  const slideshowImages = images;

  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section 
      id="home" 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background slideshow */}
      <div className="absolute inset-0 z-0">
        {slideshowImages.length > 0 ? (
          <img 
            src={backgroundImage || `/uploads/${slideshowImages[0]?.filename}`}
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
        <h1 
          className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white" 
          data-testid="hero-title"
          dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br />') }}
        />
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto" data-testid="hero-description">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold hover-lift" 
            onClick={() => setLocation("/portfolio")}
            data-testid="button-view-portfolio"
          >
            {ctaPrimary}
          </Button>
          <Button 
            variant="outline"
            className="border-2 border-white text-white hover:bg-white hover:text-background px-8 py-3 font-semibold" 
            onClick={() => handleScrollToSection("#contact")}
            data-testid="button-get-in-touch"
          >
            {ctaSecondary}
          </Button>
        </div>
      </div>
    </section>
  );
};

// TypesSection Component
export const TypesSection = ({ title, subtitle, types }: {
  title: string;
  subtitle: string;
  types: Array<{
    name: string;
    subtitle: string;
    tag: string;
  }>;
}) => {
  const [, setLocation] = useLocation();

  const handleTypeClick = (tag: string) => {
    setLocation(`/portfolio?filter=${tag}`);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card" data-testid="types-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="types-title">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="types-description">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {types.map((type, index) => (
            <Card 
              key={index}
              className="type-button rounded-xl overflow-hidden hover-lift cursor-pointer group bg-gradient-to-br from-card to-secondary border-none" 
              onClick={() => handleTypeClick(type.tag)}
              data-testid={`type-button-${type.tag}`}
            >
              <div className="relative h-80">
                <div className="absolute inset-0 image-overlay"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-serif font-bold mb-2 capitalize" data-testid={`type-title-${type.tag}`}>
                      {type.name}
                    </h3>
                    <p className="text-lg opacity-90" data-testid={`type-subtitle-${type.tag}`}>
                      {type.subtitle}
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
  );
};

// ProjectsCarousel Component
export const ProjectsCarousel = ({ title, subtitle, featured }: {
  title: string;
  subtitle: string;
  featured?: boolean;
}) => {
  const [, setLocation] = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  
  useEffect(() => {
    async function loadProjects() {
      try {
        const projectsData = await storage.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    }
    loadProjects();
  }, []);

  const displayProjects = featured ? projects.filter((project: any) => project.featured) : projects;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="featured-projects-section">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4" data-testid="featured-projects-title">
              {title}
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="featured-projects-description">
              {subtitle}
            </p>
          </div>
        </div>
        
        {projectsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading projects...</div>
          </div>
        ) : displayProjects.length > 0 ? (
          <div className="flex space-x-6 overflow-x-auto carousel-container pb-4" data-testid="featured-projects-carousel">
            {displayProjects.slice(0, 4).map((project: any) => (
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
            No projects available yet.
          </div>
        )}
      </div>
    </section>
  );
};

// PortfolioSection Component
export const PortfolioSection = ({ title, subtitle, showFilters, availableTags }: {
  title: string;
  subtitle: string;
  showFilters: boolean;
  availableTags: Array<{ value: string }>;
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [allImages, setAllImages] = useState<Image[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, imagesData] = await Promise.all([
          storage.getProjects(),
          storage.getImages()
        ]);
        setProjects(projectsData);
        setAllImages(imagesData);
      } catch (error) {
        console.error('Failed to load portfolio data:', error);
      } finally {
        setProjectsLoading(false);
        setImagesLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter projects based on selected tag
  const filteredProjects = projects.filter((project: any) => {
    if (selectedTag === "all") return true;
    
    const projectImages = allImages.filter((img: any) => img.projectId === project.id);
    return projectImages.some((img: any) => img.tags.includes(selectedTag));
  });

  const getProjectImages = (projectId: string) => {
    let projectImages = allImages.filter((img: any) => img.projectId === projectId);
    
    if (selectedTag !== "all") {
      projectImages = projectImages.filter((img: any) => img.tags.includes(selectedTag));
    }
    
    return projectImages;
  };

  const handleFilterChange = (tag: string) => {
    setSelectedTag(tag);
  };

  const tags = availableTags.map(item => item.value);

  if (projectsLoading || imagesLoading) {
    return (
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted" data-testid="portfolio-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="portfolio-title">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="portfolio-description">
            {subtitle}
          </p>
        </div>
        
        {/* Filter Controls */}
        {showFilters && (
          <div className="flex flex-wrap justify-center gap-4 mb-12" data-testid="portfolio-filters">
            <Button
              variant={selectedTag === "all" ? "default" : "secondary"}
              onClick={() => handleFilterChange("all")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                selectedTag === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground"
              }`}
              data-testid="filter-button-all"
            >
              All Projects
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "secondary"}
                onClick={() => handleFilterChange(tag)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 capitalize ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground"
                }`}
                data-testid={`filter-button-${tag}`}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
        
        {/* Project Groups */}
        <div className="space-y-16" data-testid="portfolio-projects">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project: any) => {
              const projectImages = getProjectImages(project.id);
              
              if (selectedTag !== "all" && projectImages.length === 0) {
                return null;
              }
              
              return (
                <div 
                  key={project.id} 
                  className="project-group" 
                  data-testid={`project-group-${project.id}`}
                >
                  <div className="mb-8">
                    <h3 className="text-3xl font-serif font-bold mb-2" data-testid={`project-title-${project.id}`}>
                      {project.title}
                    </h3>
                    <p className="text-lg text-muted-foreground" data-testid={`project-description-${project.id}`}>
                      {project.description}
                    </p>
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {project.tags.map((tag: string) => (
                          <span 
                            key={tag}
                            className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm capitalize"
                            data-testid={`project-tag-${tag}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {projectImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projectImages.map((image: any) => (
                        <Card 
                          key={image.id} 
                          className="group cursor-pointer overflow-hidden border-none hover-lift" 
                          data-testid={`image-card-${image.id}`}
                        >
                          <img 
                            src={`/uploads/${image.filename}`} 
                            alt={image.originalName}
                            className="w-full h-64 object-cover transition-transform duration-200 group-hover:scale-105" 
                            data-testid={`image-${image.id}`}
                          />
                          {image.tags.length > 0 && (
                            <div className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {image.tags.map((tag: string) => (
                                  <span 
                                    key={tag}
                                    className="bg-accent/20 text-accent px-2 py-1 rounded text-xs capitalize"
                                    data-testid={`image-tag-${tag}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8" data-testid={`no-images-${project.id}`}>
                      No images available for this project.
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-12" data-testid="no-projects">
              {selectedTag === "all" 
                ? "No projects available yet." 
                : `No projects found with "${selectedTag}" tag.`
              }
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// StorySection Component
export const StorySection = ({ title, paragraphs, experienceYears, ctaText }: {
  title: string;
  paragraphs: Array<{ value: string }>;
  experienceYears: string;
  ctaText: string;
}) => {
  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="story" className="py-20 px-4 sm:px-6 lg:px-8 bg-background" data-testid="story-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="story-title">
              {title}
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              {paragraphs.map((paragraph, index) => (
                <p key={index} data-testid={`story-paragraph-${index + 1}`}>
                  {paragraph.value}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 font-semibold" 
                onClick={() => handleScrollToSection("#contact")}
                data-testid="button-start-project"
              >
                {ctaText}
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="w-full h-96 bg-muted rounded-xl shadow-2xl flex items-center justify-center text-muted-foreground">
              Master craftsman portrait placeholder
            </div>
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-bold" data-testid="experience-years">{experienceYears}</div>
                <div className="text-sm font-semibold" data-testid="experience-label">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ContactSection Component
export const ContactSection = ({ title, subtitle, phone, email, address }: {
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted" data-testid="contact-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="contact-title">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="contact-description">
            {subtitle}
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
                  <div className="text-muted-foreground" data-testid="contact-phone">{phone}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <div className="font-semibold" data-testid="contact-email-label">Email</div>
                  <div className="text-muted-foreground" data-testid="contact-email">{email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-primary text-primary-foreground p-3 rounded-full">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <div className="font-semibold" data-testid="contact-studio-label">Studio</div>
                  <div className="text-muted-foreground" data-testid="contact-studio">{address}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="bg-background p-8 border-none">
            <form className="space-y-6" onSubmit={handleSubmit} data-testid="contact-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="project-type">Project Type</Label>
                <select 
                  id="project-type"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
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
                <Label htmlFor="message">Project Details</Label>
                <Textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
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
  );
};
