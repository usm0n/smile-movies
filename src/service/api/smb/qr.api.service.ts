import { smbV1API } from "../api";

export const qrAPI = {
  generate: async (): Promise<{ token: string; expiresIn: number }> => {
    const r = await smbV1API.post("/qr/generate");
    return r.data;
  },
  poll: async (token: string): Promise<{ status: "pending" | "approved" | "expired" }> => {
    const r = await smbV1API.get(`/qr/poll/${token}`);
    return r.data;
  },
  approve: async (token: string): Promise<{ success: boolean }> => {
    const r = await smbV1API.post("/qr/approve", { token });
    return r.data;
  },
  approveDevice: async (pendingDeviceId: string): Promise<{ success: boolean; message: string }> => {
    const r = await smbV1API.post("/qr/approve-device", { pendingDeviceId });
    return r.data;
  },
};
