import { createContext, useContext, useState } from "react";
import { oc } from "../service/api/oc/oc.api.service";

const OCContext = createContext({
  getLocation: async () => {},
  locationData: {
    loading: false,
    error: false,
    data: {
      latitude: 0,
      longitude: 0,
      continent: "",
      country: "",
      state: "",
      county: "",
      road: "",
      town: "",
    },
  },
});

export const useOC = () => useContext(OCContext);

const OCProvider = ({ children }: { children: React.ReactNode }) => {
  const [locationData, setLocationData] = useState({
    loading: false,
    error: false,
    data: {
      latitude: 0,
      longitude: 0,
      continent: "",
      country: "",
      state: "",
      county: "",
      road: "",
      town: "",
    },
  });

  const getLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationData({
          loading: true,
          error: false,
          data: {
            latitude: 0,
            longitude: 0,
            continent: "",
            country: "",
            state: "",
            county: "",
            road: "",
            town: "",
          },
        });
        const { latitude, longitude } = position.coords;
        const response = await oc.getLocation(latitude, longitude);
        if (response) {
          console.log(response);

          setLocationData({
            loading: false,
            error: false,
            data: {
              latitude: latitude,
              longitude: longitude,
              continent: response.continent,
              country: response.country,
              state: response.state,
              county: response.county,
              road: response.road,
              town: response.town,
            },
          });
        }
      },
      (error) => {
        console.log(error);
        setLocationData({
          loading: false,
          error: true,
          data: {
            latitude: 0,
            longitude: 0,
            continent: "",
            country: "",
            state: "",
            county: "",
            road: "",
            town: "",
          },
        });
      }
    );
  };

  return (
    <OCContext.Provider value={{ getLocation, locationData }}>
      {children}
    </OCContext.Provider>
  );
};
export default OCProvider;
