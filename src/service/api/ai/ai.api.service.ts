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

export interface AIChatResponse {
  sessionId: string;
  reply: string;
  recommendations: AIRecommendation[];
  searchQueries: string[];
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
};
