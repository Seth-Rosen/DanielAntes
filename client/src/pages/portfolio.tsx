import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useLocation } from "wouter";

export default function Portfolio() {
  const [, setLocation] = useLocation();
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Parse URL parameters for filtering
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    const project = params.get("project");
    
    if (filter) setSelectedTag(filter);
    if (project) setSelectedProject(project);
  }, []);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => api.getProjects(),
  });

  const { data: allImages = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["/api/images"],
    queryFn: () => api.getImages(),
  });

  // Filter projects based on selected tag and project
  const filteredProjects = projects.filter((project: any) => {
    if (selectedProject && project.id !== selectedProject) return false;
    
    if (selectedTag === "all") return true;
    
    // Check if project has images with the selected tag
    const projectImages = allImages.filter((img: any) => img.projectId === project.id);
    return projectImages.some((img: any) => img.tags.includes(selectedTag));
  });

  // Get images for filtered projects
  const getProjectImages = (projectId: string) => {
    let projectImages = allImages.filter((img: any) => img.projectId === projectId);
    
    // If a tag is selected, only show images with that tag
    if (selectedTag !== "all") {
      projectImages = projectImages.filter((img: any) => img.tags.includes(selectedTag));
    }
    
    return projectImages;
  };

  const handleFilterChange = (tag: string) => {
    setSelectedTag(tag);
    setSelectedProject(null);
    
    // Update URL
    const params = new URLSearchParams();
    if (tag !== "all") params.set("filter", tag);
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  };

  const availableTags = ["parquet", "medallion", "mandala"];

  if (projectsLoading || imagesLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-20 flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <section className="pt-20 py-20 px-4 sm:px-6 lg:px-8 bg-muted" data-testid="portfolio-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6" data-testid="portfolio-title">
              Portfolio
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="portfolio-description">
              Explore our complete collection of bespoke marquetry and hardwood flooring projects
            </p>
          </div>
          
          {/* Filter Controls */}
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
            {availableTags.map((tag) => (
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
          
          {/* Project Groups */}
          <div className="space-y-16" data-testid="portfolio-projects">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project: any) => {
                const projectImages = getProjectImages(project.id);
                
                // Skip projects with no images if filtering by tag
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
                      <h2 className="text-3xl font-serif font-bold mb-2" data-testid={`project-title-${project.id}`}>
                        {project.title}
                      </h2>
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

      <Footer />
    </div>
  );
}
