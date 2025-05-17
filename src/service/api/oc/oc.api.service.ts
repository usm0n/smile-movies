import { Location } from "../../../user";
import { ocAPI } from "../api";

export const oc = {
  getLocation: async (lat: number, long: number): Promise<Location> => {
    const response = await ocAPI.get(
      `?q=${lat}+${long}&key=${import.meta.env.VITE_OC_API_KEY}`
    );
    return response.data.results[0].components as Location;
  },
};
