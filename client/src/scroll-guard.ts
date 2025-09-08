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
    } catch {
      // no-op
    }
  }
}
