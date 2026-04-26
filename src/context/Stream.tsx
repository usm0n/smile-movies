import { createContext, useContext, useState } from "react";
import { providersAPI } from "../service/api/smb/providers.api.service";
import { VixsrcStreamResponse } from "../types/providers";

const StreamContext = createContext({
    getStreamData: {
        isLoading: false,
        isAvailable: false,
        errorMessage: "",
        data: null as VixsrcStreamResponse | null,
    },
    getStream: async (
      _movieType: "movie" | "tv",
      _movieId: string,
      _seasonId?: string,
      _episodeId?: string,
    ) => { },
})

export const useStream = () => useContext(StreamContext);

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
    const [getStreamData, setGetStreamData] = useState<{
        isLoading: boolean;
        isAvailable: boolean;
        errorMessage: string;
        data: VixsrcStreamResponse | null;
    }>({
        isLoading: false,
        isAvailable: false,
        errorMessage: "",
        data: null,
    });

    const getStream = async (
      movieType: "movie" | "tv",
      movieId: string,
      seasonId?: string,
      episodeId?: string,
    ) => {
        try {
            setGetStreamData({
              isLoading: true,
              isAvailable: false,
              errorMessage: "",
              data: null,
            });
            const response = await providersAPI.getVixsrcStream(
                movieType,
                movieId,
                seasonId ? parseInt(seasonId) : undefined,
                episodeId ? parseInt(episodeId) : undefined,
            );
            setGetStreamData({
                isLoading: false,
                isAvailable: Boolean(response.data?.available && response.data?.stream?.masterPlaylistUrl),
                errorMessage: "",
                data: response.data,
            });
        } catch (error: any) {
            setGetStreamData({
              isLoading: false,
              isAvailable: false,
              errorMessage: String(
                error?.response?.data?.message ||
                  error?.data?.message ||
                  "Unable to load stream",
              ),
              data: null,
            });
        }
    };

    return (
        <StreamContext.Provider value={{ getStreamData, getStream }}>
            {children}
        </StreamContext.Provider>
    );
}
