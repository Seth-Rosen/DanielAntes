let userHasScrolled = false;
let lastSavedY = 0;
let initialized = false;

function onUserScroll() {
  userHasScrolled = true;
}

export const ScrollGuard = {
  init() {
    if (initialized || typeof window === 'undefined') return;
    initialized = true;
    window.addEventListener('scroll', onUserScroll, { passive: true });
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
  },
  save() {
    if (typeof window === 'undefined') return;
    lastSavedY = window.scrollY || 0;
  },
  restoreIfChanged() {
    if (typeof window === 'undefined') return;
    if (userHasScrolled) return; // Do not fight the user
    const currentY = window.scrollY || 0;
    if (currentY !== lastSavedY) {
      window.scrollTo({ top: lastSavedY, behavior: 'auto' });
    }
  },
  resetUserScrolled() {
    userHasScrolled = false;
  },
  get hasUserScrolled() {
    return userHasScrolled;
  }
};
