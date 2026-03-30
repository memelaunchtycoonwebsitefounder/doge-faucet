/**
 * Pop-under ad management utility
 * Ensures pop-unders only show once per session or on first visit
 */

const POPUNDER_STORAGE_KEY = "doge_faucet_popunder_shown";
const POPUNDER_URLS = [
  "https://pl29014555.profitablecpmratenetwork.com/17/8e/40/178e4091eddcb131be13ce883019531d.js",
  "https://pl29014556.profitablecpmratenetwork.com/0ee654d9e26c67d753bcd60504761f2b/invoke.js",
  "https://pl29014557.profitablecpmratenetwork.com/ca/c6/f4/cac6f4ed784dcc38f734d31b268d344f.js",
];

/**
 * Check if pop-under has already been shown this session
 */
export function hasPopunderBeenShown(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(POPUNDER_STORAGE_KEY) === "true";
}

/**
 * Mark pop-under as shown for this session
 */
export function markPopunderAsShown(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(POPUNDER_STORAGE_KEY, "true");
}

/**
 * Load a single pop-under ad
 */
export function loadPopunderAd(url: string): void {
  if (typeof window === "undefined") return;

  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  script.setAttribute("data-cfasync", "false");
  document.head.appendChild(script);
}

/**
 * Load pop-under ads only on first visit
 * Call this in useEffect on page mount
 */
export function loadPopunderOnFirstVisit(): void {
  if (typeof window === "undefined") return;

  // Only show on first visit per session
  if (hasPopunderBeenShown()) {
    return;
  }

  // Load one random pop-under
  const randomUrl = POPUNDER_URLS[Math.floor(Math.random() * POPUNDER_URLS.length)];
  loadPopunderAd(randomUrl);

  // Mark as shown
  markPopunderAsShown();
}

/**
 * Load multiple pop-unders with delay between them
 * Useful for pages with longer engagement
 */
export function loadMultiplePopunders(count: number = 2, delayMs: number = 5000): void {
  if (typeof window === "undefined") return;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const randomUrl = POPUNDER_URLS[Math.floor(Math.random() * POPUNDER_URLS.length)];
      loadPopunderAd(randomUrl);
    }, delayMs * (i + 1));
  }
}

/**
 * Reset pop-under tracking (for testing)
 */
export function resetPopunderTracking(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(POPUNDER_STORAGE_KEY);
}
