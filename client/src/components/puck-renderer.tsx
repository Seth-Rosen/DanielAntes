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
    (window as any).__enableScrollGuard?.();
  }, [data]);

  // Guard against late programmatic scroll jumps for a short time after mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let active = true;
    let lockY = window.scrollY;
    let userScrolled = false;

    const markUser = () => { userScrolled = true; };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)) userScrolled = true;
    };

    const onScroll = () => {
      if (!active) return;
      const y = window.scrollY;
      // If a non-user jump moves us far or to top, restore previous position
      if (!userScrolled && (y === 0 || Math.abs(y - lockY) > 80)) {
        requestAnimationFrame(() => window.scrollTo({ top: lockY, left: 0, behavior: 'auto' }));
      } else {
        lockY = y;
      }
    };

    window.addEventListener('wheel', markUser, { passive: true });
    window.addEventListener('touchmove', markUser, { passive: true });
    window.addEventListener('keydown', onKey, { passive: true } as any);
    window.addEventListener('scroll', onScroll, { passive: true });

    const timer = setTimeout(() => {
      active = false;
      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('wheel', markUser as any);
      window.removeEventListener('touchmove', markUser as any);
      window.removeEventListener('keydown', onKey as any);
    }, 1600);

    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('wheel', markUser as any);
      window.removeEventListener('touchmove', markUser as any);
      window.removeEventListener('keydown', onKey as any);
    };
  }, [data]);

  return (
    <div data-testid="puck-renderer">
      <Render config={config} data={data} />
    </div>
  );
}
