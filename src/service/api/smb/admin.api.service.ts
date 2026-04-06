import { smbV1API } from "../api";
import { AdminRole } from "../../../types/admin";

export const adminAPI = {
  getBootstrapStatus: async () => {
    const response = await smbV1API.get("/admin/bootstrap/status");
    return response;
  },
  bootstrap: async () => {
    const response = await smbV1API.post("/admin/bootstrap");
    return response;
  },
  getUsers: async () => {
    const response = await smbV1API.get("/admin/users");
    return response;
  },
  updateUser: async (id: string, payload: { isBanned?: boolean; isVerified?: boolean }) => {
    const response = await smbV1API.patch(`/admin/users/${id}`, payload);
    return response;
  },
  updateRoles: async (id: string, roles: AdminRole[]) => {
    const response = await smbV1API.patch(`/admin/users/${id}/roles`, { roles });
    return response;
  },
  getNotifications: async () => {
    const response = await smbV1API.get("/admin/notifications");
    return response;
  },
  getReleases: async () => {
    const response = await smbV1API.get("/admin/releases");
    return response;
  },
  getAuditLogs: async () => {
    const response = await smbV1API.get("/admin/audit-logs");
    return response;
  },
  getModerationQueue: async () => {
    const response = await smbV1API.get("/admin/moderation");
    return response;
  },
  moderateReview: async (id: string, status: "visible" | "hidden" | "removed" | "pending") => {
    const response = await smbV1API.patch(`/admin/moderation/${id}`, { status });
    return response;
  },
};
