import { smbAPI } from "../api";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAtMs?: number;
  recommendations?: AIRecommendation[];
}

export interface AIRecommendation {
  title: string;
  mediaType: "movie" | "tv" | "unknown";
  year: number | null;
  reason: string;
}

export interface ListAction {
  action: "add" | "create_and_add";
  listName: string;
  title: string;
  mediaType: "movie" | "tv";
  tmdbId?: number;
}

export interface AIChatResponse {
  sessionId: string;
  reply: string;
  recommendations: AIRecommendation[];
  searchQueries: string[];
  listActions?: ListAction[];
}

export interface AIChatSessionSummary {
  sessionId: string;
  title: string;
  lastAssistantPreview: string;
  createdAtMs: number;
  updatedAtMs: number;
  messageCount: number;
}

export interface AIChatSessionDetail extends AIChatSessionSummary {
  messages: ChatMessage[];
}

export interface AIChatHistoryListResponse {
  sessions: AIChatSessionSummary[];
}

export interface AIChatHistorySessionResponse {
  session: AIChatSessionDetail;
}

export interface ParentalGuideResult {
  sex_nudity: { rating: string; description: string };
  violence_gore: { rating: string; description: string };
  profanity: { rating: string; description: string };
  alcohol_drugs: { rating: string; description: string };
  frightening: { rating: string; description: string };
  family_friendly: boolean;
  minimum_age: number;
}

/** A title the AI suggested, before it has been resolved against TMDB. */
export interface SuggestedTitle {
  title: string;
  mediaType: "movie" | "tv";
  year: number | null;
  reason: string;
}

/**
 * A search-rescue hit. Unlike `SuggestedTitle` these come straight from TMDB's
 * own index rather than from the model, so the id and title are real by
 * construction and need no second lookup.
 */
export interface GroundedResult {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string;
  year: number | null;
  overview: string;
  voteAverage: number;
  /** Which signal surfaced it — "amnesia + revenge", "title match". */
  matchedOn: string;
}

export interface SearchAssistResult {
  interpretation: string;
  /** Human-readable account of what was actually searched for. */
  strategy: string;
  results: GroundedResult[];
  _cached?: boolean;
}

export interface CollectionFillResult {
  titles: SuggestedTitle[];
}

export interface EpisodeRecapResult {
  recap: string;
  beats: string[];
  /** Set instead of a recap when there is nothing before this episode. */
  unavailable?: string;
  _cached?: boolean;
}

export interface PriorEpisodeInput {
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
}

export interface ReviewSummaryResult {
  summary?: string;
  liked?: string[];
  disliked?: string[];
  consensus?: "Positive" | "Mixed" | "Negative";
  reviewCount: number;
  averageRating?: number;
  /** Set instead of a summary when there are too few reviews. */
  unavailable?: string;
  _cached?: boolean;
}

export interface MatchScoreResult {
  score: number;
  reasoning: string;
  age_warning: string | null;
  genre_match: "High" | "Medium" | "Low";
}

export const aiService = {
  chat: async (messages: ChatMessage[], sessionId?: string) => {
    const response = await smbAPI.post("/ai/chat", {
      messages,
      ...(sessionId ? { sessionId } : {}),
    });
    return response.data as AIChatResponse;
  },

  listHistory: async () => {
    const response = await smbAPI.get("/ai/history");
    return response.data as AIChatHistoryListResponse;
  },

  getHistorySession: async (sessionId: string) => {
    const response = await smbAPI.get(`/ai/history/${sessionId}`);
    return response.data as AIChatHistorySessionResponse;
  },

  deleteHistorySession: async (sessionId: string) => {
    const response = await smbAPI.delete(`/ai/history/${sessionId}`);
    return response.data as { message: string };
  },

  clearHistory: async () => {
    const response = await smbAPI.delete("/ai/history");
    return response.data as { message: string };
  },

  parentalGuide: async (params: {
    movieTitle: string;
    movieYear?: string | number;
    overview?: string;
    certification?: string;
    genres?: string[];
  }) => {
    const response = await smbAPI.post("/ai/parental-guide", params);
    return response.data as ParentalGuideResult;
  },

  matchScore: async (params: {
    movieTitle: string;
    movieYear?: string | number;
    overview?: string;
    genres?: string[];
    certification?: string;
  }) => {
    const response = await smbAPI.post("/ai/match-score", params);
    return response.data as MatchScoreResult;
  },

  /** Rescues a search that TMDB returned nothing for. */
  searchAssist: async (query: string) => {
    const response = await smbAPI.post("/ai/search-assist", { query });
    return response.data as SearchAssistResult;
  },

  /** Suggests titles that belong in a list, based on its name and contents. */
  collectionFill: async (params: {
    listName: string;
    existingTitles?: string[];
  }) => {
    const response = await smbAPI.post("/ai/collection-fill", params);
    return response.data as CollectionFillResult;
  },

  /** Spoiler-free catch-up on the episodes before the one about to play. */
  recap: async (params: {
    title: string;
    seasonNumber: number;
    episodeNumber: number;
    priorEpisodes: PriorEpisodeInput[];
  }) => {
    const response = await smbAPI.post("/ai/recap", params);
    return response.data as EpisodeRecapResult;
  },

  /** What the community thought, distilled. Reviews are read server-side. */
  reviewSummary: async (params: { mediaType: "movie" | "tv"; mediaId: string }) => {
    const response = await smbAPI.post("/ai/review-summary", params);
    return response.data as ReviewSummaryResult;
  },
};
