import { getVidLinkProVideo } from "@usm0n/stream-utils";

export const vidsrc = {
  getVideo: async (
    movieId: string,
    movieType: "movie" | "tv",
    season?: number,
    episode?: number
  ) => {
    try {
      const params =
        movieType === "movie"
          ? { id: movieId, type: movieType }
          : {
              id: movieId,
              type: movieType,
              season: season!,
              episode: episode!,
            };
      const movieVideo = await getVidLinkProVideo(params);
      return movieVideo;
    } catch (error) {
      throw error;
    }
  },
};
