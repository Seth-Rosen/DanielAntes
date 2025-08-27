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

  // STEP D: Test minimal working data (bypass real data temporarily)
  const minimalTestData = {
    root: { props: { title: "Test" } },
    content: [
      { type: "HeroSection", props: {} }
    ]
  };

  console.log("=== STEP D - MINIMAL DATA TEST ===");
  console.log("Using test data instead of real data");
  console.log("Test data:", minimalTestData);
  console.log("==================================");

  return (
    <div className="h-full min-h-screen puck-root" data-testid="puck-editor">
      <Puck
        config={config}
        data={minimalTestData}
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
