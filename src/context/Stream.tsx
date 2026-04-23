import { createContext, useContext, useState } from "react";
import { providersAPI } from "../service/api/smb/providers.api.service";
import { VixsrcStreamResponse } from "../types/providers";

const StreamContext = createContext({
    getStreamData: {
        isLoading: false,
        isAvailable: false,
        data: null as VixsrcStreamResponse | null,
    },
    getStream: async (_movieType: "movie" | "tv", _movieId: string, _seasonId?: string, _episodeId?: string) => { },
})

export const useStream = () => useContext(StreamContext);

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
    const [getStreamData, setGetStreamData] = useState<{
        isLoading: boolean;
        isAvailable: boolean;
        data: VixsrcStreamResponse | null;
    }>({
        isLoading: false,
        isAvailable: false,
        data: null,
    });

    const getStream = async (movieType: "movie" | "tv", movieId: string, seasonId?: string, episodeId?: string) => {
        try {
            setGetStreamData({ isLoading: true, isAvailable: false, data: null });
            const response = await providersAPI.getVixsrcStream(
                movieType,
                movieId,
                seasonId ? parseInt(seasonId) : undefined,
                episodeId ? parseInt(episodeId) : undefined,
            );
            setGetStreamData({
                isLoading: false,
                isAvailable: Boolean(response.data?.available && response.data?.stream?.masterPlaylistUrl),
                data: response.data,
            });
        } catch (error) {
            setGetStreamData({ isLoading: false, isAvailable: false, data: null });
        }
    };

    return (
        <StreamContext.Provider value={{ getStreamData, getStream }}>
            {children}
        </StreamContext.Provider>
    );
}
