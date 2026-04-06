import { smbV1API } from "../api";
import { ReviewReactionType, ReviewModerationStatus } from "../../../types/reviews";

export const reviewsAPI = {
  getMediaReviews: async (mediaType: "movie" | "tv", mediaId: string) => {
    const response = await smbV1API.get(`/media/${mediaType}/${mediaId}/reviews`);
    return response;
  },
  createMediaReview: async (
    mediaType: "movie" | "tv",
    mediaId: string,
    payload: Record<string, unknown>,
  ) => {
    const response = await smbV1API.post(`/media/${mediaType}/${mediaId}/reviews`, payload);
    return response;
  },
  updateReview: async (id: string, payload: Record<string, unknown>) => {
    const response = await smbV1API.patch(`/reviews/${id}`, payload);
    return response;
  },
  deleteReview: async (id: string) => {
    const response = await smbV1API.delete(`/reviews/${id}`);
    return response;
  },
  reactToReview: async (id: string, reaction: ReviewReactionType) => {
    const response = await smbV1API.post(`/reviews/${id}/react`, { reaction });
    return response;
  },
  reportReview: async (id: string, reason: string) => {
    const response = await smbV1API.post(`/reviews/${id}/report`, { reason });
    return response;
  },
  getModerationQueue: async () => {
    const response = await smbV1API.get("/admin/moderation");
    return response;
  },
  moderateReview: async (id: string, status: ReviewModerationStatus) => {
    const response = await smbV1API.patch(`/admin/moderation/${id}`, { status });
    return response;
  },
};
