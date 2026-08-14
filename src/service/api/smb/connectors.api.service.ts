import { smbAPI } from "../api";
import { deviceId, deviceName, deviceType } from "../../../utilities/defaults";
import type { Location } from "../../../user";
import type {
  ConnectorsResponse,
  Identity,
  IdentityProvider,
  AccountEmail,
} from "../../../types/connectors";

const devicePayload = (deviceLocation?: Location) => ({
  deviceId: deviceId(),
  deviceName: deviceName(),
  deviceType: deviceType(),
  deviceLocation: deviceLocation || {},
});

export const connectorsAPI = {
  /** Everything the Settings → Login connections panel renders. */
  list: async (): Promise<ConnectorsResponse> => {
    const response = await smbAPI.get("/users/connectors");
    return response.data;
  },

  // ── Sign-in ────────────────────────────────────────────────────────────────
  /** Exchanges a Firebase ID token for our session cookie. */
  signInWithFirebase: async (
    idToken: string,
    profile: { firstname?: string; lastname?: string },
    deviceLocation?: Location,
  ) => {
    const response = await smbAPI.post("/users/auth/firebase", {
      idToken,
      firstname: profile.firstname || "",
      lastname: profile.lastname || "",
      ...devicePayload(deviceLocation),
    });
    return response.data as { message: string; created: boolean };
  },

  getBotInfo: async () => {
    const response = await smbAPI.get("/users/auth/phone/bot");
    return response.data as { configured: boolean; botUsername: string };
  },

  requestPhoneCode: async (phone: string) => {
    const response = await smbAPI.post("/users/auth/phone/request", { phone });
    return response.data as { message: string; expiresAt: number };
  },

  verifyPhoneCode: async (
    phone: string,
    code: string,
    firstname?: string,
    deviceLocation?: Location,
  ) => {
    const response = await smbAPI.post("/users/auth/phone/verify", {
      phone,
      code,
      firstname: firstname || "",
      ...devicePayload(deviceLocation),
    });
    return response.data as { message: string; created: boolean };
  },

  // ── Linking from Settings ──────────────────────────────────────────────────
  linkFirebase: async (idToken: string) => {
    const response = await smbAPI.post("/users/connectors/firebase", { idToken });
    return response.data as { message: string; identities: Identity[] };
  },

  requestPhoneLink: async (phone: string) => {
    const response = await smbAPI.post("/users/connectors/phone/request", { phone });
    return response.data as { message: string; expiresAt: number };
  },

  verifyPhoneLink: async (phone: string, code: string) => {
    const response = await smbAPI.post("/users/connectors/phone/verify", {
      phone,
      code,
    });
    return response.data as { message: string; identities: Identity[] };
  },

  unlink: async (provider: IdentityProvider, subject?: string) => {
    const path = subject
      ? `/users/connectors/${encodeURIComponent(provider)}/${encodeURIComponent(subject)}`
      : `/users/connectors/${encodeURIComponent(provider)}`;
    const response = await smbAPI.delete(path);
    return response.data as { message: string; identities: Identity[] };
  },

  setPassword: async (newPassword: string) => {
    const response = await smbAPI.post("/users/setPassword", { newPassword });
    return response.data as { message: string; identities: Identity[] };
  },

  // ── Email addresses ────────────────────────────────────────────────────────
  addEmail: async (email: string) => {
    const response = await smbAPI.post("/users/emails", { email });
    return response.data as { message: string; emails: AccountEmail[] };
  },

  verifyEmail: async (email: string, token: string) => {
    const response = await smbAPI.post("/users/emails/verify", { email, token });
    return response.data as { message: string; emails: AccountEmail[] };
  },

  setPrimaryEmail: async (email: string) => {
    const response = await smbAPI.post("/users/emails/primary", { email });
    return response.data as { message: string; emails: AccountEmail[] };
  },

  removeEmail: async (email: string) => {
    const response = await smbAPI.delete(
      `/users/emails/${encodeURIComponent(email)}`,
    );
    return response.data as { message: string; emails: AccountEmail[] };
  },

  // ── Avatar ─────────────────────────────────────────────────────────────────
  uploadAvatar: async (base64: string, mimeType: string) => {
    const response = await smbAPI.post("/users/upload-profile-pic", {
      base64,
      mimeType,
    });
    return response.data as { message: string; url: string; path?: string };
  },

  deleteAvatar: async () => {
    const response = await smbAPI.delete("/users/profile-pic");
    return response.data as { message: string };
  },
};
