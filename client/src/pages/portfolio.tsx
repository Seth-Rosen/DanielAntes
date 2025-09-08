import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { storage } from "@/lib/storage";
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
    queryKey: ["projects"],
    queryFn: () => storage.getProjects(),
  });

  const { data: allImages = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["images"],
    queryFn: () => storage.getImages(),
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
          <div className="animate-pulse">
            <div className="w-48 h-8 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">Portfolio</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Explore our collection of handcrafted wood flooring projects. Each piece represents 
              decades of expertise and dedication to timeless craftsmanship.
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="border-y border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              <span className="text-sm font-medium whitespace-nowrap">Filter by:</span>
              <div className="flex gap-2">
                <Button
                  variant={selectedTag === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  data-testid="button-filter-all"
                >
                  All Styles
                </Button>
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(tag)}
                    className="capitalize"
                    data-testid={`button-filter-${tag}`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects found with the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {filteredProjects.map((project: any) => {
                  const projectImages = getProjectImages(project.id);
                  
                  return (
                    <div key={project.id} className="border-b border-border pb-16 last:border-0">
                      {/* Project Header */}
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
                        <p className="text-muted-foreground">{project.location}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {project.year} • {project.area}
                        </p>
                        {project.description && (
                          <p className="mt-4 text-foreground/90 max-w-3xl">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {/* Project Images Grid */}
                      {projectImages.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {projectImages.map((image: any) => (
                            <Card
                              key={image.id}
                              className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => setLocation(`/gallery?image=${image.id}`)}
                              data-testid={`card-image-${image.id}`}
                            >
                              <div className="aspect-[4/3] overflow-hidden">
                                <img
                                  src={`/uploads/${image.filename}`}
                                  alt={image.originalName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              {image.tags.length > 0 && (
                                <div className="p-3 bg-muted/50">
                                  <div className="flex flex-wrap gap-1">
                                    {image.tags.map((tag: string) => (
                                      <span
                                        key={tag}
                                        className="text-xs px-2 py-1 bg-background rounded-md capitalize"
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
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
