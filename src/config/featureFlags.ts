// Simple feature flag system

export const FeatureFlags = {
  // Toggle for the new A/B testable auth flow
  NEW_AUTH_FLOW: "new_auth_flow_v2",
};

export const isFeatureEnabled = (flag: string): boolean => {
  // Check URL params first for easy testing without changing local storage
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.has(flag)) {
      return params.get(flag) === "true";
    }

    // Fallback to local storage
    return localStorage.getItem(flag) === "true";
  }
  return false;
};

// Helper to enable/disable flags in console
export const setFeatureFlag = (flag: string, enabled: boolean) => {
  if (enabled) {
    localStorage.setItem(flag, "true");
  } else {
    localStorage.removeItem(flag);
  }
  console.log(`Feature ${flag} is now ${enabled ? "enabled" : "disabled"}`);
};

// Expose to window for console access
if (typeof window !== "undefined") {
  (window as any).FeatureFlags = {
    set: setFeatureFlag,
    get: isFeatureEnabled,
    flags: FeatureFlags,
  };
}
