import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { useLocation } from "wouter";
import { Page, Project, Image } from "@shared/schema";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [projectForm, setProjectForm] = useState({ title: "", description: "", tags: "" });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imageForm, setImageForm] = useState({ 
    projectId: "", 
    tags: "", 
    slideshow: false, 
    carouselFeature: false, 
    featured: false 
  });
  
  // Static storage state
  const [projects, setProjects] = useState<Project[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Drag-and-drop state
  const [dragPageIndex, setDragPageIndex] = useState<number | null>(null);
  const [dragProjectIndex, setDragProjectIndex] = useState<number | null>(null);
  // Project editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectForm, setEditProjectForm] = useState<{ title: string; description: string; tags: string }>({ title: "", description: "", tags: "" });

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [projectsData, imagesData, pagesData] = await Promise.all([
          storage.getProjects(),
          storage.getImages(),
          storage.getPages()
        ]);
        setProjects(projectsData);
        setImages(imagesData);
        setPages(pagesData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({ title: "Failed to load data", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [toast]);

  const handleCreatePage = () => {
    setLocation("/builder");
  };

  const handleEditPage = (pageId: string) => {
    setLocation(`/builder/${pageId}`);
  };

  const handleDeletePage = async (pageId: string) => {
    try {
      await storage.deletePage(pageId);
      setPages(pages.filter(p => p.id !== pageId));
      toast({ title: "Page deleted", description: "Changes saved locally" });
    } catch (error) {
      console.error('Failed to delete page:', error);
      toast({ title: "Failed to delete page", variant: "destructive" });
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = projectForm.tags.split(',').map(t => t.trim()).filter(t => t);
      const newProject = await storage.saveProject({
        title: projectForm.title,
        description: projectForm.description,
        images: [],
        tags,
        featured: false,
        order: 0
      });
      
      setProjects([...projects, newProject]);
      setProjectForm({ title: "", description: "", tags: "" });
      toast({ title: "Project created", description: "Changes saved locally" });
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({ title: "Failed to create project", variant: "destructive" });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await storage.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      toast({ title: "Project deleted", description: "Changes saved locally" });
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  };

  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "Please select files to upload", variant: "destructive" });
      return;
    }

    try {
      const tags = imageForm.tags.split(',').map(t => t.trim()).filter(t => t);
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        // For now, just create image records with file names
        // In production, we'd upload to GitHub or cloud storage
        const newImage = await storage.saveImage({
          filename: file.name,
          originalName: file.name,
          url: `/uploads/${file.name}`,  // Placeholder URL for now
          alt: "",
          projectIds: imageForm.projectId ? [imageForm.projectId] : [],
          tags,
          slideshow: imageForm.slideshow,
          carouselFeature: imageForm.carouselFeature,
          featured: imageForm.featured
        });
        
        setImages([...images, newImage]);
      }
      
      setSelectedFiles(null);
      setImageForm({ 
        projectId: "", 
        tags: "", 
        slideshow: false, 
        carouselFeature: false, 
        featured: false 
      });
      
      toast({ 
        title: `${selectedFiles.length} image(s) uploaded`, 
        description: "File records created locally" 
      });
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast({ title: "Failed to upload images", variant: "destructive" });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await storage.deleteImage(imageId);
      setImages(images.filter(i => i.id !== imageId));
      toast({ title: "Image deleted", description: "Changes saved locally" });
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast({ title: "Failed to delete image", variant: "destructive" });
    }
  };

  // Reorder utilities
  const reorder = <T,>(list: T[], startIndex: number, endIndex: number) => {
    const result = list.slice();
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed as T);
    return result;
  };

  const persistPageOrder = async (newPages: Page[]) => {
    try {
      const updated = await storage.reorderPages(newPages);
      setPages(updated);
      toast({ title: "Navigation order updated" });
    } catch (e) {
      console.error('Failed to persist page order', e);
      toast({ title: "Failed to save order", variant: "destructive" });
    }
  };

  const handlePageDrop = async (targetIndex: number) => {
    if (dragPageIndex === null) return;
    const newOrder = reorder(pages, dragPageIndex, targetIndex);
    setDragPageIndex(null);
    await persistPageOrder(newOrder);
  };

  const persistProjectOrder = async (newProjects: Project[]) => {
    try {
      const updated = await storage.reorderProjects(newProjects);
      setProjects(updated);
      toast({ title: "Projects order updated" });
    } catch (e) {
      console.error('Failed to persist project order', e);
      toast({ title: "Failed to save order", variant: "destructive" });
    }
  };

  const handleProjectDrop = async (targetIndex: number) => {
    if (dragProjectIndex === null) return;
    const newOrder = reorder(projects, dragProjectIndex, targetIndex);
    setDragProjectIndex(null);
    await persistProjectOrder(newOrder);
  };

  const startEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setEditProjectForm({
      title: p.title,
      description: p.description || "",
      tags: (p.tags || []).join(", "),
    });
  };

  const saveEditProject = async (projectId: string) => {
    try {
      const existing = projects.find(p => p.id === projectId);
      if (!existing) return;
      const tags = editProjectForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const updated = await storage.saveProject({
        id: projectId,
        title: editProjectForm.title,
        description: editProjectForm.description,
        images: existing.images,
        tags,
        featured: existing.featured,
        order: existing.order || 0,
      });
      setProjects(projects.map(p => p.id === projectId ? updated : p));
      setEditingProjectId(null);
      toast({ title: "Project updated" });
    } catch (e) {
      console.error('Failed to update project', e);
      toast({ title: "Failed to update project", variant: "destructive" });
    }
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
  };

  if (isLoading) {
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
      
      <main className="pt-20 px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
          
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Note: This is a local-only admin interface. Changes are saved in-memory and will be lost on refresh.
              GitHub integration coming in Phase 3.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pages Management */}
            <Card>
              <CardHeader>
                <CardTitle>Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCreatePage} 
                  className="w-full mb-4"
                  data-testid="button-create-page"
                >
                  Create New Page
                </Button>
                
                <div className="space-y-2">
                  {pages.map((page, index) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      draggable
                      onDragStart={() => setDragPageIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handlePageDrop(index)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="cursor-grab select-none text-muted-foreground">⋮⋮</span>
                        <div>
                          <p className="font-medium">{page.title}</p>
                          <p className="text-sm text-muted-foreground">{page.slug}</p>
                          {page.published && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Published
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPage(page.id)}
                          data-testid={`button-edit-page-${page.id}`}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePage(page.id)}
                          data-testid={`button-delete-page-${page.id}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  {pages.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No pages yet. Create your first page!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Projects Management */}
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="space-y-4 mb-4">
                  <div>
                    <Label htmlFor="project-title">Project Title</Label>
                    <Input
                      id="project-title"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      placeholder="Enter project title"
                      required
                      data-testid="input-project-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Enter project description"
                      data-testid="textarea-project-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-tags">Tags (comma-separated)</Label>
                    <Input
                      id="project-tags"
                      value={projectForm.tags}
                      onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                      placeholder="parquet, medallion, mandala"
                      data-testid="input-project-tags"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-create-project">
                    Create Project
                  </Button>
                </form>
                
                <div className="space-y-2">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleProjectDrop(index)}
                      onDragEnd={() => setDragProjectIndex(null)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span
                          className="cursor-grab select-none text-muted-foreground"
                          draggable
                          onDragStart={() => setDragProjectIndex(index)}
                        >⋮⋮</span>
                        <div className="flex-1">
                          {editingProjectId === project.id ? (
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4">
                              <div>
                                <Label htmlFor={`edit-title-${project.id}`}>Title</Label>
                                <Input
                                  id={`edit-title-${project.id}`}
                                  value={editProjectForm.title}
                                  onChange={(e) => setEditProjectForm({ ...editProjectForm, title: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label htmlFor={`edit-description-${project.id}`}>Description</Label>
                                <Textarea
                                  id={`edit-description-${project.id}`}
                                  value={editProjectForm.description}
                                  onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-3">
                                <Label htmlFor={`edit-tags-${project.id}`}>Tags (comma-separated)</Label>
                                <Input
                                  id={`edit-tags-${project.id}`}
                                  value={editProjectForm.tags}
                                  onChange={(e) => setEditProjectForm({ ...editProjectForm, tags: e.target.value })}
                                  placeholder="parquet, medallion, mandala"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{project.title}</p>
                              {project.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {editingProjectId === project.id ? (
                          <>
                            <Button size="sm" variant="default" onClick={() => saveEditProject(project.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={cancelEditProject}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => startEditProject(project)}>Edit</Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProject(project.id)}
                              data-testid={`button-delete-project-${project.id}`}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {projects.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No projects yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Image Upload */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadImage} className="space-y-4">
                  <div>
                    <Label htmlFor="image-files">Select Images</Label>
                    <Input
                      id="image-files"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      data-testid="input-image-files"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image-project">Project (optional)</Label>
                    <select
                      id="image-project"
                      value={imageForm.projectId}
                      onChange={(e) => setImageForm({ ...imageForm, projectId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md"
                      data-testid="select-image-project"
                    >
                      <option value="">No Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="image-tags">Tags (comma-separated)</Label>
                    <Input
                      id="image-tags"
                      value={imageForm.tags}
                      onChange={(e) => setImageForm({ ...imageForm, tags: e.target.value })}
                      placeholder="parquet, medallion, living-room"
                      data-testid="input-image-tags"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={imageForm.slideshow}
                        onChange={(e) => setImageForm({ ...imageForm, slideshow: e.target.checked })}
                      />
                      <span>Include in Slideshow</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={imageForm.carouselFeature}
                        onChange={(e) => setImageForm({ ...imageForm, carouselFeature: e.target.checked })}
                      />
                      <span>Carousel Feature</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={imageForm.featured}
                        onChange={(e) => setImageForm({ ...imageForm, featured: e.target.checked })}
                      />
                      <span>Featured</span>
                    </label>
                  </div>
                  
                  <Button type="submit" className="w-full" data-testid="button-upload-images">
                    Upload Images
                  </Button>
                </form>
                
                {/* Images List */}
                {images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Uploaded Images</h3>
                    <div className="space-y-2">
                      {images.map((image) => (
                        <div 
                          key={image.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <p className="text-sm font-medium">{image.originalName}</p>
                            {image.tags.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Tags: {image.tags.join(', ')}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteImage(image.id)}
                            data-testid={`button-delete-image-${image.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
