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
    <div className="h-full puck-root" data-testid="puck-editor">
      <Puck
        config={config}
        data={data}
        onPublish={handleSave}
        headerActions={
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </div>
            )}
          </div>
        }
        overrides={{
          header: ({ actions, children }) => (
            <div className="bg-card border-b border-border px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-foreground">Visual Editor</span>
                {children}
              </div>
              <div className="flex items-center gap-2">
                {actions}
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
}
