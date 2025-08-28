import { Puck } from "@measured/puck";
import { config } from "@/components/puck-config";
import "@measured/puck/puck.css";

interface PuckEditorProps {
  data: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function PuckEditor({ data, onSave, isLoading }: PuckEditorProps) {
  console.log('PuckEditor received data:', data);
  
  const handleSave = (data: any) => {
    console.log('Saving data:', data);
    onSave(data);
  };
  
  // Puck expects either:
  // 1. content as flat array OR
  // 2. content with zones object
  // Let's try the simpler flat array format
  let safeData;
  
  if (data && typeof data === 'object') {
    if (Array.isArray(data.content)) {
      // Already flat array format
      safeData = data;
    } else if (data.content && typeof data.content === 'object') {
      // Convert zones format to flat array
      safeData = {
        content: data.content.main || [],
        root: data.root || { props: { title: "Page" } }
      };
    } else {
      // Default empty structure
      safeData = {
        content: [],
        root: { props: { title: "Page" } }
      };
    }
  } else {
    // Default empty structure
    safeData = {
      content: [],
      root: { props: { title: "Page" } }
    };
  }
  
  console.log('Using safeData:', safeData);

  return (
    <div className="h-full puck-root" data-testid="puck-editor">
      <Puck
        config={config}
        data={safeData}
        onPublish={handleSave}
        headerTitle="Visual Editor"
        overrides={{
          headerActions: () => (
            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </div>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
}