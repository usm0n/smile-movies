import { smbV1API } from "../api";
import { NotificationPreferences } from "../../../user";

export const notificationsAPI = {
  getHistory: async () => {
    const response = await smbV1API.get("/me/notifications/history");
    return response;
  },
  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    const response = await smbV1API.patch("/me/notification-preferences", preferences);
    return response;
  },
  unsubscribe: async (token: string) => {
    const response = await smbV1API.post(`/notifications/unsubscribe/${token}`);
    return response;
  },
  adminCreateReleaseEvent: async (payload: Record<string, unknown>) => {
    const response = await smbV1API.post("/notifications/admin/release-events", payload);
    return response;
  },
  adminProcessPending: async () => {
    const response = await smbV1API.post("/notifications/admin/process");
    return response;
  },
  adminSyncTmdb: async () => {
    const response = await smbV1API.post("/notifications/admin/sync-tmdb");
    return response;
  },
};
