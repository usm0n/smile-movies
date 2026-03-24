import { createContext, useContext, useEffect, useState } from "react";

const defaultLocation = {
  latitude: 0, longitude: 0,
  continent: "", country: "", state: "", county: "", road: "",
};

const OCContext = createContext({
  locationData: { loading: false, error: false, data: defaultLocation },
  getLocation: async () => {},
});

export const useOC = () => useContext(OCContext);

const OCProvider = ({ children }: { children: React.ReactNode }) => {
  const [locationData, setLocationData] = useState({
    loading: false, error: false, data: defaultLocation,
  });

  const getLocation = async () => {
    if (locationData.data.country) return; // already fetched
    setLocationData((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("https://ipapi.co/json/");
      const d = await res.json();
      setLocationData({
        loading: false,
        error: false,
        data: {
          latitude: d.latitude ?? 0,
          longitude: d.longitude ?? 0,
          continent: d.continent_code ?? "",
          country: d.country_name ?? "",
          state: d.region ?? "",
          county: d.city ?? "",
          road: "",
        },
      });
    } catch (_) {
      // Location is completely optional — login/register still work without it
      setLocationData({ loading: false, error: true, data: defaultLocation });
    }
  };

  // Fetch silently on app start so it's ready by the time login/register open
  useEffect(() => { getLocation(); }, []);

  return (
    <OCContext.Provider value={{ locationData, getLocation }}>
      {children}
    </OCContext.Provider>
  );
};

export default OCProvider;
