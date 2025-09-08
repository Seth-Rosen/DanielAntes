// Global scroll interceptor to prevent unintended jump-to-top from external scripts
if (typeof window !== 'undefined') {
  const w: any = window as any;
  if (!w.__scrollPatchInstalled) {
    w.__scrollPatchInstalled = true;

    // Allow programmatic scrolls we trigger
    w.__allowNextProgrammaticScroll = (duration: number = 600) => {
      w.__scrollAllowUntil = Date.now() + duration;
    };
    const isAllowed = () => (w.__scrollAllowUntil || 0) > Date.now();

    try {
      const origScrollTo = window.scrollTo.bind(window);
      // @ts-ignore
      window.scrollTo = function(...args: any[]) {
        let targetY = window.scrollY;
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
          if (typeof args[0].top === 'number') targetY = args[0].top;
        } else if (args.length >= 2 && typeof args[1] === 'number') {
          targetY = args[1];
        }
        if (!isAllowed() && targetY === 0 && window.scrollY > 100) {
          return; // ignore unintended jump-to-top
        }
        return origScrollTo.apply(window, args as any);
      } as any;

      const origSIV = (Element.prototype as any).scrollIntoView;
      (Element.prototype as any).scrollIntoView = function(...args: any[]) {
        if (!isAllowed() && window.scrollY > 100) {
          return; // block unexpected programmatic scrolls
        }
        return origSIV.apply(this, args as any);
      };

      if ('scrollRestoration' in history) {
        try { history.scrollRestoration = 'manual'; } catch {}
      }

      // Anti-scroll: immediately restore previous position when a non-user jump to top is detected
      let lastY = window.scrollY;
      let restoring = false;
      let lastUserEventAt = 0;
      const markUser = () => { lastUserEventAt = Date.now(); };
      window.addEventListener('wheel', markUser, { passive: true });
      window.addEventListener('touchmove', markUser, { passive: true });
      window.addEventListener('keydown', markUser as any, { passive: true } as any);

      const onScroll = () => {
        const now = Date.now();
        const userRecent = now - lastUserEventAt < 250;
        const y = window.scrollY;
        if (!restoring && !userRecent && y === 0 && lastY > 120) {
          restoring = true;
          w.__allowNextProgrammaticScroll?.(200);
          const target = lastY;
          requestAnimationFrame(() => {
            window.scrollTo({ top: target, left: 0, behavior: 'auto' });
            // end restoring on next frame
            requestAnimationFrame(() => { restoring = false; });
          });
          return;
        }
        lastY = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    } catch {
      // no-op
    }
  }
}
