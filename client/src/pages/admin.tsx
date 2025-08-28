import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { useLocation } from "wouter";
import { Page, Project, Image } from "@shared/schema";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isLoggedIn, setIsLoggedIn] = useState(auth.isAuthenticated());
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
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

  // Load data when authenticated
  useEffect(() => {
    async function loadData() {
      if (isLoggedIn) {
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
    }
    
    loadData();
  }, [isLoggedIn, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await auth.login(loginForm.username, loginForm.password);
      if (success) {
        setIsLoggedIn(true);
        toast({ title: "Login successful" });
      } else {
        toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({ title: "Login failed", variant: "destructive" });
    }
  };

  const createProject = async () => {
    try {
      const tags = projectForm.tags ? projectForm.tags.split(",").map(tag => tag.trim()) : [];
      const newProject = await storage.saveProject({
        title: projectForm.title,
        description: projectForm.description,
        tags,
        images: [],
        featured: false,
      });
      
      setProjects(prev => [...prev, newProject]);
      setProjectForm({ title: "", description: "", tags: "" });
      toast({ title: "Project created successfully" });
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({ title: "Failed to create project", variant: "destructive" });
    }
  };

  const uploadImage = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "Please select files", variant: "destructive" });
      return;
    }
    
    try {
      // For now, we'll simulate image upload by creating image records
      // In a real static implementation, images would be handled by the hosting provider
      const tags = imageForm.tags ? imageForm.tags.split(",").map(tag => tag.trim()) : [];
      
      for (const file of Array.from(selectedFiles)) {
        const newImage = await storage.saveImage({
          filename: file.name,
          originalName: file.name,
          projectId: imageForm.projectId || undefined,
          tags,
          slideshow: imageForm.slideshow,
          carouselFeature: imageForm.carouselFeature,
          featured: imageForm.featured,
        });
        
        setImages(prev => [...prev, newImage]);
      }
      
      setSelectedFiles(null);
      setImageForm({ 
        projectId: "", 
        tags: "", 
        slideshow: false, 
        carouselFeature: false, 
        featured: false 
      });
      toast({ title: "Images uploaded successfully" });
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast({ title: "Failed to upload images", variant: "destructive" });
    }
  };

  const deleteImage = async (id: string) => {
    try {
      await storage.deleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
      toast({ title: "Image deleted successfully" });
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast({ title: "Failed to delete image", variant: "destructive" });
    }
  };


  const handleLogout = async () => {
    await auth.logout();
    setIsLoggedIn(false);
    toast({ title: "Logged out successfully" });
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    createProject();
  };

  const handleUploadImage = (e: React.FormEvent) => {
    e.preventDefault();
    uploadImage();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="w-full max-w-md" data-testid="login-card">
            <CardHeader>
              <CardTitle data-testid="login-title">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    data-testid="input-username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    data-testid="input-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <section className="pt-20 py-12 px-4 sm:px-6 lg:px-8" data-testid="admin-dashboard">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-4" data-testid="dashboard-title">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground" data-testid="dashboard-description">
                Manage your portfolio content and projects
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => setLocation("/builder")} 
                variant="outline"
                data-testid="button-page-builder"
              >
                <i className="fas fa-edit mr-2"></i>
                New Page
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Management */}
            <Card data-testid="project-management-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-folder mr-2 text-primary"></i>
                  Project Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCreateProject} className="space-y-4">
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
                      required
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
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-create-project"
                  >
                    {isLoading ? "Creating..." : "Create Project"}
                  </Button>
                </form>

                <div className="space-y-2" data-testid="existing-projects">
                  <h4 className="font-semibold">Existing Projects:</h4>
                  {projects.map((project: any) => (
                    <div 
                      key={project.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      data-testid={`project-item-${project.id}`}
                    >
                      <span data-testid={`project-name-${project.id}`}>{project.title}</span>
                      <div className="flex gap-2">
                        <span className="text-sm text-muted-foreground">
                          {project.images?.length || 0} images
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Image Upload */}
            <Card data-testid="image-upload-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-images mr-2 text-primary"></i>
                  Image Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleUploadImage} className="space-y-4">
                  <div>
                    <Label htmlFor="image-file">Select Image</Label>
                    <Input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      required
                      data-testid="input-image-file"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image-project">Project (optional)</Label>
                    <select
                      id="image-project"
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring"
                      value={imageForm.projectId}
                      onChange={(e) => setImageForm({ ...imageForm, projectId: e.target.value })}
                      data-testid="select-image-project"
                    >
                      <option value="">Select project...</option>
                      {projects.map((project: any) => (
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
                      placeholder="parquet, medallion, mandala"
                      data-testid="input-image-tags"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        checked={imageForm.slideshow}
                        onChange={(e) => setImageForm({ ...imageForm, slideshow: e.target.checked })}
                        data-testid="checkbox-slideshow"
                      />
                      <span className="text-sm">Use in slideshow</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        checked={imageForm.carouselFeature}
                        onChange={(e) => setImageForm({ ...imageForm, carouselFeature: e.target.checked })}
                        data-testid="checkbox-carousel"
                      />
                      <span className="text-sm">Featured in carousel</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        checked={imageForm.featured}
                        onChange={(e) => setImageForm({ ...imageForm, featured: e.target.checked })}
                        data-testid="checkbox-featured"
                      />
                      <span className="text-sm">Featured image</span>
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    data-testid="button-upload-image"
                  >
                    {isLoading ? "Uploading..." : "Upload Image"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Pages Management */}
          <Card className="mt-8" data-testid="pages-management-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-file-alt mr-2 text-primary"></i>
                Pages Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="existing-pages">
                {pages.map((page: any) => (
                  <Card 
                    key={page.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-border"
                    onClick={() => setLocation(`/builder/${page.id}`)}
                    data-testid={`page-card-${page.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold truncate" data-testid={`page-title-${page.id}`}>
                          {page.title}
                        </h4>
                        <div className={`w-2 h-2 rounded-full ${page.published ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`page-slug-${page.id}`}>
                        /{page.slug}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {page.published ? 'Published' : 'Draft'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-muted-foreground/30"
                  onClick={() => setLocation("/builder")}
                  data-testid="new-page-card"
                >
                  <CardContent className="p-4 flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <i className="fas fa-plus text-2xl mb-2"></i>
                      <div className="font-semibold">Create New Page</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Image Gallery */}
          <Card className="mt-8" data-testid="image-gallery-card">
            <CardHeader>
              <CardTitle>Uploaded Images</CardTitle>
            </CardHeader>
            <CardContent>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" data-testid="image-gallery">
                  {images.map((image: any) => (
                    <div key={image.id} className="relative group" data-testid={`gallery-image-${image.id}`}>
                      <img 
                        src={`/uploads/${image.filename}`} 
                        alt={image.originalName}
                        className="w-full h-32 object-cover rounded-lg" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteImage(image.id)}
                          data-testid={`button-delete-image-${image.id}`}
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </Button>
                      </div>
                      {image.tags.length > 0 && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex flex-wrap gap-1">
                            {image.tags.slice(0, 2).map((tag: string) => (
                              <span 
                                key={tag}
                                className="bg-primary/80 text-primary-foreground px-1 py-0.5 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {image.tags.length > 2 && (
                              <span className="bg-primary/80 text-primary-foreground px-1 py-0.5 rounded text-xs">
                                +{image.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8" data-testid="no-images">
                  No images uploaded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
