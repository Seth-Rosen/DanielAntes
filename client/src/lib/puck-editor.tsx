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

  return (
    <div className="h-full w-full puck-root" data-testid="puck-editor" style={{ height: '100%' }}>
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
