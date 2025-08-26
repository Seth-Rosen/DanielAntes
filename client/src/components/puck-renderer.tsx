import { Render } from "@measured/puck";
import { config } from "@/components/puck-config";

interface PuckRendererProps {
  data: any;
}

export function PuckRenderer({ data }: PuckRendererProps) {
  return (
    <div data-testid="puck-renderer">
      <Render config={config} data={data} />
    </div>
  );
}
