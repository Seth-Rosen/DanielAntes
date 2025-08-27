import { Puck } from "@measured/puck";
import { config } from "@/components/puck-config";
import "@measured/puck/puck.css";

// Override Puck's CSS to fix drop zone height
const puckOverrideStyles = `
  .puck-root [data-rfd-droppable-id="droppable-root"] {
    min-height: calc(100vh - 150px) !important;
  }
  .puck-root .Puck-canvas {
    min-height: calc(100vh - 150px) !important;
  }
  .puck-root [data-puck-drop-zone] {
    min-height: calc(100vh - 150px) !important;
  }
  .puck-root .Puck-preview {
    min-height: calc(100vh - 150px) !important;
  }
`;

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
    <>
      <style dangerouslySetInnerHTML={{ __html: puckOverrideStyles }} />
      <div className="h-full w-full puck-root" data-testid="puck-editor" style={{ height: 'calc(100vh - 73px)' }}>
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
    </>
  );
}
