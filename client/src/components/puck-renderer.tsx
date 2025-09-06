import { useEffect } from "react";
import { Render } from "@measured/puck";
import { config } from "@/components/puck-config";

interface PuckRendererProps {
  data: any;
}

export function PuckRenderer({ data }: PuckRendererProps) {
  useEffect(() => {
    // @ts-ignore
    if ((import.meta as any).env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[ScrollDebug] PuckRenderer mounted', { t: performance.now(), data });
    }
  }, [data]);

  return (
    <div data-testid="puck-renderer">
      <Render config={config} data={data} />
    </div>
  );
}
