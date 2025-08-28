import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { storage } from "@/lib/storage";
import { useLocation } from "wouter";
import { PuckEditor } from "@/lib/puck-editor";
import { Page } from "@shared/schema";

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
    published: false,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
          published: false,
        });
        setIsLoading(false);
      }
    }
    
    loadPage();
  }, [pageId, toast]);

  const savePage = async (data: any, publish: boolean = false) => {
    try {
      setIsSaving(true);
      
      const saveData = {
        title: pageData.title,
        slug: pageData.slug,
        data,
        published: publish || pageData.published,
        ...(pageId && { id: pageId })
      };
      
      const savedPage = await storage.savePage(saveData);
      
      toast({ 
        title: publish ? "Page published!" : "Page saved!",
        description: "Changes saved locally (in-memory only for now)"
      });
      
      // If it was a new page, navigate to the edit URL
      if (!pageId) {
        setLocation(`/builder/${savedPage.id}`);
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

  const handlePublish = async (data: any) => {
    try {
      const savedPage = await savePage(data, true);
      setPageData(prev => ({ ...prev, published: true }));
      setHasUnsavedChanges(false);
      
      toast({ 
        title: "Page published!",
        description: `Your changes are now live at ${savedPage.slug}`
      });
    } catch (error) {
      // Error already handled in savePage
    }
  };

  const handleSaveDraft = async (data: any) => {
    try {
      await savePage(data, false);
      setHasUnsavedChanges(false);
      
      toast({ 
        title: "Draft saved!",
        description: "Your changes have been saved as a draft"
      });
    } catch (error) {
      // Error already handled in savePage
    }
  };

  const handleDataChange = (data: any) => {
    setPageData(prev => ({ ...prev, data }));
    setHasUnsavedChanges(true);
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
              <Label htmlFor="page-slug">Slug:</Label>
              <Input
                id="page-slug"
                value={pageData.slug}
                onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-48"
                placeholder="/page-url"
                data-testid="input-page-slug"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <span className="text-sm text-amber-600 dark:text-amber-400 px-2 py-1 bg-amber-50 dark:bg-amber-950 rounded">
                Unsaved changes
              </span>
            ) : pageData.published ? (
              <span className="text-sm text-green-600 dark:text-green-400 px-2 py-1 bg-green-50 dark:bg-green-950 rounded">
                Published
              </span>
            ) : (
              <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded">
                Draft
              </span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSaveDraft(pageData.data)}
              disabled={isSaving || !hasUnsavedChanges}
              data-testid="button-save-draft"
            >
              Save Draft
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={() => handlePublish(pageData.data)}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-publish"
            >
              {isSaving ? "Publishing..." : "Publish"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(pageData.slug, '_blank')}
              disabled={!pageData.published}
              data-testid="button-preview"
            >
              Preview Live
            </Button>
          </div>
        </div>
      </div>
      
      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <PuckEditor
          data={pageData.data}
          onSave={handlePublish}
          onChange={handleDataChange}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}