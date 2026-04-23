import {
  VixsrcAvailabilityBatchResponse,
  VixsrcAvailabilityItem,
  VixsrcMediaType,
  VixsrcStreamResponse,
} from "../../../types/providers";
import { smbV1API } from "../api";

const AVAILABILITY_CACHE_TTL_MS = 30 * 60 * 1000;

type AvailabilityRequestItem = {
  mediaType: VixsrcMediaType;
  tmdbId: string;
  season?: number;
  episode?: number;
};

type CachedAvailability = {
  expiresAt: number;
  data: VixsrcAvailabilityItem;
};

const availabilityCache = new Map<string, CachedAvailability>();
const availabilityRequests = new Map<string, Promise<{ data: VixsrcAvailabilityItem }>>();

const buildAvailabilityCacheKey = ({
  mediaType,
  tmdbId,
  season,
  episode,
}: AvailabilityRequestItem) =>
  `${mediaType}:${tmdbId}:${mediaType === "tv" ? `${season || 0}:${episode || 0}` : "0:0"}`;

const getCachedAvailability = (key: string) => {
  const cached = availabilityCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) {
    return null;
  }

  return cached.data;
};

const getStaleAvailability = (key: string) => availabilityCache.get(key)?.data || null;

const cacheAvailability = (item: VixsrcAvailabilityItem) => {
  availabilityCache.set(buildAvailabilityCacheKey(item), {
    expiresAt: Date.now() + AVAILABILITY_CACHE_TTL_MS,
    data: item,
  });
};

const buildSyntheticAvailabilityResponse = (item: VixsrcAvailabilityItem) =>
  ({ data: item } as { data: VixsrcAvailabilityItem });

const buildSyntheticAvailabilityBatchResponse = (items: VixsrcAvailabilityItem[]) =>
  ({ data: { items } } as { data: VixsrcAvailabilityBatchResponse });

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
    const item = {
      mediaType,
      tmdbId: String(tmdbId),
      season,
      episode,
    };
    const key = buildAvailabilityCacheKey(item);
    const cached = getCachedAvailability(key);

    if (cached) {
      return buildSyntheticAvailabilityResponse(cached);
    }

    const inFlight = availabilityRequests.get(key);
    if (inFlight) {
      return inFlight;
    }

    const request = smbV1API.get<VixsrcAvailabilityItem>(
      `/providers/vixsrc/availability/${mediaType}/${tmdbId}`,
      {
        params: {
          ...(season ? { season } : {}),
          ...(episode ? { episode } : {}),
        },
      },
    )
      .then((response) => {
        if (response.data) {
          cacheAvailability(response.data);
        }
        return response as { data: VixsrcAvailabilityItem };
      })
      .catch((error) => {
        const stale = getStaleAvailability(key);
        if (stale) {
          return buildSyntheticAvailabilityResponse(stale);
        }
        throw error;
      })
      .finally(() => {
        availabilityRequests.delete(key);
      });

    availabilityRequests.set(key, request);
    return request;
  },
  getVixsrcAvailabilityBatch: async (
    items: AvailabilityRequestItem[],
  ) => {
    const cachedItems: VixsrcAvailabilityItem[] = [];
    const missingItems: AvailabilityRequestItem[] = [];

    items.forEach((item) => {
      const cached = getCachedAvailability(buildAvailabilityCacheKey(item));
      if (cached) {
        cachedItems.push(cached);
        return;
      }

      missingItems.push(item);
    });

    if (!missingItems.length) {
      return buildSyntheticAvailabilityBatchResponse(cachedItems);
    }

    try {
      const response = await smbV1API.post<VixsrcAvailabilityBatchResponse>(
        "/providers/vixsrc/availability",
        { items: missingItems },
      );
      const resolvedItems = response.data?.items || [];
      resolvedItems.forEach(cacheAvailability);

      return buildSyntheticAvailabilityBatchResponse([
        ...cachedItems,
        ...resolvedItems,
      ]);
    } catch (error) {
      if (cachedItems.length) {
        return buildSyntheticAvailabilityBatchResponse(cachedItems);
      }

      throw error;
    }
  },
};
