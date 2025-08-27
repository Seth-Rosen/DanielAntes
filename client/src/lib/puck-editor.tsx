import { Puck } from "@measured/puck";
import { config } from "@/components/puck-config";
import "@measured/puck/puck.css";

interface PuckEditorProps {
  data: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export function PuckEditor({ data, onSave, isLoading }: PuckEditorProps) {
  const handleSave = (data: any) => {
    onSave(data);
  };

  // STEP A: Debug - Log what data Puck receives
  console.log("=== PUCK PROP DEBUG ===");
  console.log("Puck receives data:", data);
  console.log("Data type:", typeof data);
  console.log("Data keys:", Object.keys(data || {}));
  if (data?.content) {
    console.log("Content array length:", data.content.length);
    console.log("Content types:", data.content.map((item: any) => item.type));
  }
  console.log("======================");

  return (
    <div className="h-full min-h-screen puck-root" data-testid="puck-editor">
      <Puck
        config={config}
        data={data}
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
