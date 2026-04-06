import { smbV1API } from "../api";
import { NotificationInterests, NotificationPreferences } from "../../../user";

export const notificationsAPI = {
  getHistory: async () => {
    const response = await smbV1API.get("/me/notifications/history");
    return response;
  },
  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    const response = await smbV1API.patch("/me/notification-preferences", preferences);
    return response;
  },
  getInterests: async () => {
    const response = await smbV1API.get("/me/notification-interests");
    return response;
  },
  updateInterests: async (interests: Partial<NotificationInterests>) => {
    const response = await smbV1API.patch("/me/notification-interests", interests);
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
  adminRunScheduled: async () => {
    const response = await smbV1API.post("/notifications/admin/run-scheduled");
    return response;
  },
};
