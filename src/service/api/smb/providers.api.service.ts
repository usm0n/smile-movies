import {
  VixsrcAvailabilityBatchResponse,
  VixsrcAvailabilityItem,
  VixsrcMediaType,
  VixsrcStreamResponse,
} from "../../../types/providers";
import { smbV1API } from "../api";

export const providersAPI = {
  getVixsrcStream: async (
    mediaType: VixsrcMediaType,
    tmdbId: string,
    season?: number,
    episode?: number,
  ) => {
    const response = await smbV1API.get<VixsrcStreamResponse>(
      `/providers/vixsrc/stream/${mediaType}/${tmdbId}`,
      {
        params: {
          ...(season ? { season } : {}),
          ...(episode ? { episode } : {}),
        },
      },
    );
    return response;
  },
  getVixsrcAvailability: async (
    mediaType: VixsrcMediaType,
    tmdbId: string,
    season?: number,
    episode?: number,
  ) => {
    const response = await smbV1API.get<VixsrcAvailabilityItem>(
      `/providers/vixsrc/availability/${mediaType}/${tmdbId}`,
      {
        params: {
          ...(season ? { season } : {}),
          ...(episode ? { episode } : {}),
        },
      },
    );
    return response;
  },
  getVixsrcAvailabilityBatch: async (
    items: Array<{
      mediaType: VixsrcMediaType;
      tmdbId: string;
      season?: number;
      episode?: number;
    }>,
  ) => {
    const response = await smbV1API.post<VixsrcAvailabilityBatchResponse>(
      "/providers/vixsrc/availability",
      { items },
    );
    return response;
  },
};
