import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { PuckEditor } from "@/lib/puck-editor";

export default function Builder() {
  const { pageId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isLoggedIn, setIsLoggedIn] = useState(auth.isAuthenticated());
  const [pageData, setPageData] = useState({
    title: "New Page",
    slug: "new-page", 
    data: { content: [], root: { props: { title: "" } } },
    published: false,
  });

  // Load existing page if pageId is provided
  const { data: page, isLoading } = useQuery({
    queryKey: ["/api/pages", pageId],
    queryFn: () => pageId ? api.getPages().then(pages => pages.find((p: any) => p.id === pageId)) : null,
    enabled: !!pageId && isLoggedIn,
  });

  useEffect(() => {
    if (page) {
      setPageData({
        title: page.title,
        slug: page.slug,
        data: page.data || { content: [], root: { props: { title: page.title } } },
        published: page.published,
      });
    } else if (!pageId) {
      // Reset to new page defaults when no pageId
      setPageData({
        title: "New Page",
        slug: "new-page", 
        data: { content: [], root: { props: { title: "New Page" } } },
        published: false,
      });
    }
  }, [page, pageId]);

  const savePageMutation = useMutation({
    mutationFn: (data: any) => {
      if (pageId) {
        return api.updatePage(pageId, data);
      } else {
        return api.createPage(data);
      }
    },
    onSuccess: (savedPage) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({ title: "Page saved successfully" });
      if (!pageId) {
        setLocation(`/builder/${savedPage.id}`);
      }
    },
    onError: () => {
      toast({ title: "Failed to save page", variant: "destructive" });
    },
  });

  if (!isLoggedIn) {
    setLocation("/admin");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Loading page builder...</div>
      </div>
    );
  }

  const handleSave = (data: any) => {
    const saveData = {
      title: pageData.title,
      slug: pageData.slug,
      data,
      published: pageData.published,
    };
    savePageMutation.mutate(saveData);
  };

  const handlePublish = () => {
    const saveData = {
      title: pageData.title,
      slug: pageData.slug,
      data: pageData.data,
      published: true,
    };
    savePageMutation.mutate(saveData);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="page-builder">
      {/* Builder Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/admin")}
              data-testid="button-back-to-admin"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Admin
            </Button>
            <div className="flex items-center space-x-4">
              <div>
                <Label htmlFor="page-title" className="text-xs text-muted-foreground">Page Title</Label>
                <Input
                  id="page-title"
                  value={pageData.title}
                  onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                  className="h-8 w-48 bg-transparent border-none focus:ring-1 focus:ring-primary"
                  data-testid="input-page-title"
                />
              </div>
              <div>
                <Label htmlFor="page-slug" className="text-xs text-muted-foreground">Slug</Label>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    id="page-slug"
                    value={pageData.slug}
                    onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                    className="h-8 w-32 bg-transparent border-none focus:ring-1 focus:ring-primary"
                    data-testid="input-page-slug"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Published:</span>
              <div className={`w-2 h-2 rounded-full ${pageData.published ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>{pageData.published ? 'Yes' : 'No'}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`/${pageData.slug}`, '_blank')}
              data-testid="button-preview"
            >
              <i className="fas fa-eye mr-2"></i>
              Preview
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handlePublish}
              disabled={savePageMutation.isPending}
              data-testid="button-publish"
            >
              {savePageMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Publishing...
                </>
              ) : (
                <>
                  <i className="fas fa-globe mr-2"></i>
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="h-[calc(100vh-73px)] min-h-screen">
        <PuckEditor 
          data={pageData.data}
          onSave={handleSave}
          isLoading={savePageMutation.isPending}
        />
      </div>
    </div>
  );
}
