export type ReviewReactionType = "helpful" | "funny" | "love";
export type ReviewModerationStatus = "visible" | "hidden" | "removed" | "pending";

export interface ReviewRecord {
  id: string;
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  authorUid: string;
  authorHandle: string;
  authorName: string;
  authorAvatar?: string;
  body: string;
  rating: number;
  containsSpoilers: boolean;
  moderationStatus: ReviewModerationStatus;
  reactionCounts: Record<ReviewReactionType, number>;
  reportCount: number;
  createdAt: string;
  createdAtMs: number;
  updatedAt: string;
  updatedAtMs: number;
}
