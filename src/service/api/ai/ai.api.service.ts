import { smbAPI } from "../api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  chat: async (messages: ChatMessage[]) => {
    const response = await smbAPI.post("/ai/chat", { messages });
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
