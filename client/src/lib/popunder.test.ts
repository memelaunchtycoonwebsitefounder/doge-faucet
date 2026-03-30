import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  hasPopunderBeenShown,
  markPopunderAsShown,
  resetPopunderTracking,
} from "./popunder";

describe("Pop-under Management", () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("should return false when pop-under has not been shown", () => {
    expect(hasPopunderBeenShown()).toBe(false);
  });

  it("should return true after marking pop-under as shown", () => {
    markPopunderAsShown();
    expect(hasPopunderBeenShown()).toBe(true);
  });

  it("should persist pop-under state across function calls", () => {
    expect(hasPopunderBeenShown()).toBe(false);
    markPopunderAsShown();
    expect(hasPopunderBeenShown()).toBe(true);
    expect(hasPopunderBeenShown()).toBe(true); // Should still be true
  });

  it("should reset pop-under tracking", () => {
    markPopunderAsShown();
    expect(hasPopunderBeenShown()).toBe(true);
    resetPopunderTracking();
    expect(hasPopunderBeenShown()).toBe(false);
  });

  it("should handle sessionStorage correctly", () => {
    const key = "doge_faucet_popunder_shown";
    expect(sessionStorage.getItem(key)).toBeNull();
    
    markPopunderAsShown();
    expect(sessionStorage.getItem(key)).toBe("true");
    
    resetPopunderTracking();
    expect(sessionStorage.getItem(key)).toBeNull();
  });
});
