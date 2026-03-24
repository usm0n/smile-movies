// Uses ipapi.co — IP-based location, no browser permission needed.
// The OCProvider calls this automatically on mount.
export const oc = {
  getLocationByIP: async () => {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) throw new Error("Location fetch failed");
    return response.json();
  },
};
