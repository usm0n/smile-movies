import { smbV1API } from "../api";

export const publicContentAPI = {
  getAppConfig: async () => {
    const response = await smbV1API.get("/app/config");
    return response;
  },
  getReleases: async () => {
    const response = await smbV1API.get("/releases");
    return response;
  },
  getLegalDocument: async (slug: string) => {
    const response = await smbV1API.get(`/legal/${slug}`);
    return response;
  },
};
