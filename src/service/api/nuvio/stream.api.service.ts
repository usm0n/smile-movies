import { StreamEmptyResponse, StreamResponse } from "../../../stream-res";
import { nuvioAPI } from "../api";

export const stream = {
    getStream: async (
        movieType: "movie" | "series",
        movieId: string,
        seasonId?: string,
        episodeId?: string,
    ): Promise<StreamResponse | StreamEmptyResponse | null> => {
        try {
            const response = await nuvioAPI.get<StreamResponse | StreamEmptyResponse>(
                `/cookie=${import.meta.env.VITE_API_KEY}/stream/${movieType}/tmdb:${movieId}${seasonId ? `:${seasonId}` : ""}${episodeId ? `:${episodeId}` : ""}.json`,
            );
            return response.data;
        } catch (error: any) {
            return error.response.data as StreamEmptyResponse;
        }
    }
}