import { smbV1API } from "../api";

/** What the signed-out screen tells the API about itself when it asks for a code. */
export interface QRDevicePayload {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  deviceLocation?: Record<string, unknown>;
}

export interface QRTokenInfo {
  status: "pending" | "approved";
  deviceName: string;
  deviceType: string;
  location: { country?: string; state?: string; county?: string; road?: string };
}

export const qrAPI = {
  /**
   * The device asking to sign in has to identify itself up front: approval is
   * what registers it on the account, and without that the session it receives
   * belongs to a device the account has never heard of.
   */
  generate: async (device: QRDevicePayload): Promise<{ token: string; expiresIn: number }> => {
    const r = await smbV1API.post("/qr/generate", device);
    return r.data;
  },
  /** Who is asking — so the approving device can recognise it before saying yes. */
  info: async (token: string): Promise<QRTokenInfo> => {
    const r = await smbV1API.get(`/qr/info/${token}`);
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
