import { smbV1API } from "../api";

export interface CollectionItem {
  id: string;
  type: "movie" | "tv";
  title?: string;
  poster?: string;
  addedAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  items: CollectionItem[];
  createdAt: string;
}

export const collectionsAPI = {
  getAll: async (): Promise<{ collections: Collection[] }> => {
    const r = await smbV1API.get("/collections");
    return r.data;
  },
  getById: async (collectionId: string): Promise<{ collection: Collection }> => {
    const r = await smbV1API.get(`/collections/${collectionId}`);
    return r.data;
  },
  create: async (name: string): Promise<{ collection: Collection }> => {
    const r = await smbV1API.post("/collections", { name });
    return r.data;
  },
  addItem: async (
    collectionId: string,
    item: { id: string; type: string; title?: string; poster?: string },
  ) => {
    const r = await smbV1API.post(`/collections/${collectionId}/items`, item);
    return r.data;
  },
  removeItem: async (
    collectionId: string,
    itemId: string,
    itemType: string,
  ) => {
    const r = await smbV1API.delete(
      `/collections/${collectionId}/items/${itemId}/${itemType}`,
    );
    return r.data;
  },
  delete: async (collectionId: string) => {
    const r = await smbV1API.delete(`/collections/${collectionId}`);
    return r.data;
  },
  rename: async (collectionId: string, name: string) => {
    const r = await smbV1API.patch(`/collections/${collectionId}`, { name });
    return r.data;
  },
};
