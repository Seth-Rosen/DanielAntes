import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { useLocation } from "wouter";
import { PuckEditor } from "@/lib/puck-editor";
import { Checkbox } from "@/components/ui/checkbox";

export default function Builder() {
  const { pageId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(!!pageId);
  const [isSaving, setIsSaving] = useState(false);
  const [pageData, setPageData] = useState({
    title: "New Page",
    slug: "new-page", 
    data: { content: { main: [] }, root: { props: { title: "New Page" } } } as any,
    published: true,
    showInNav: true,
    order: 0,
    seo: { description: "" },
  });

  // Load existing page if pageId is provided
  useEffect(() => {
    async function loadPage() {
      if (pageId) {
        try {
          setIsLoading(true);
          const page = await storage.getPage(pageId);
          if (page) {
            // Ensure page data is properly structured for Puck
            let puckData;
            if (page.data && typeof page.data === 'object') {
              // Check if data has the correct structure
              if (page.data.content && page.data.root) {
                puckData = page.data;
              } else {
                console.warn('Invalid data structure, using defaults');
                puckData = { content: { main: [] }, root: { props: { title: page.title } } };
              }
            } else {
              puckData = { content: { main: [] }, root: { props: { title: page.title } } };
            }
            
            setPageData({
              title: page.title,
              slug: page.slug,
              data: puckData,
              published: page.published,
              showInNav: page.showInNav ?? true,
              order: page.order ?? 0,
              seo: page.seo ?? { description: "" },
            });
          }
        } catch (error) {
          console.error('Failed to load page:', error);
          toast({ title: "Failed to load page", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      } else {
        // Reset to new page defaults when no pageId
        setPageData({
          title: "New Page",
          slug: "new-page", 
          data: { content: { main: [] }, root: { props: { title: "New Page" } } },
          published: true,
          showInNav: true,
          order: 0,
          seo: { description: "" },
        });
        setIsLoading(false);
      }
    }
    
    loadPage();
  }, [pageId, toast]);

  const handleSaveAndPublish = async (data: any) => {
    try {
      setIsSaving(true);
      
      const saveData = {
        title: pageData.title,
        slug: pageData.slug,
        data,
        published: pageData.published,
        showInNav: pageData.showInNav,
        order: pageData.order,
        seo: pageData.seo,
        ...(pageId && { id: pageId })
      };
      
      const savedPage = await storage.savePage(saveData);

      toast({
        title: "Page saved!",
        description: pageData.published ? `Page is live at /${savedPage.slug}` : "Page saved as unpublished"
      });

      // If it was a new page, navigate to the edit URL
      if (!pageId) {
        setLocation(`/builder/${savedPage.id}`);
      }

      // Also navigate to the live page when published to verify routing
      if (savedPage.published) {
        const href = savedPage.slug.startsWith('/') ? savedPage.slug : `/${savedPage.slug}`;
        // slight delay to ensure write completes and client refetches
        setTimeout(() => setLocation(href), 50);
      }

      return savedPage;
    } catch (error) {
      console.error('Failed to save page:', error);
      toast({ title: "Failed to save page", variant: "destructive" });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDataChange = (data: any) => {
    setPageData(prev => ({ ...prev, data }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">
          <div className="w-48 h-8 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header Bar */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin")}
              data-testid="button-back-admin"
            >
              ← Back to Admin
            </Button>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="page-title">Title:</Label>
              <Input
                id="page-title"
                value={pageData.title}
                onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                className="w-48"
                data-testid="input-page-title"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="page-slug">URL:</Label>
              <span className="text-muted-foreground">/</span>
              <Input
                id="page-slug"
                value={pageData.slug}
                onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-48"
                placeholder="page-url"
                data-testid="input-page-slug"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="page-order">Order:</Label>
              <Input
                id="page-order"
                type="number"
                value={pageData.order}
                onChange={(e) => setPageData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-20"
                data-testid="input-page-order"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-in-nav"
                checked={pageData.showInNav}
                onCheckedChange={(checked) => setPageData(prev => ({ ...prev, showInNav: checked as boolean }))}
              />
              <Label htmlFor="show-in-nav">Show in Navigation</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="published"
                checked={pageData.published}
                onCheckedChange={(checked) => setPageData(prev => ({ ...prev, published: checked as boolean }))}
              />
              <Label htmlFor="published">Published</Label>
            </div>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => handleSaveAndPublish(pageData.data)}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-save"
            >
              {isSaving ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <PuckEditor
          data={pageData.data}
          onSave={handleSaveAndPublish}
          onChange={handleDataChange}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
