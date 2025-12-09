import { createContext, useContext, useState } from "react";
import { stream } from "../service/api/nuvio/stream.api.service";
import { StreamResponse } from "../stream-res";

const StreamContext = createContext({
    getStreamData: {
        isLoading: false,
        isAvailable: false,
        data: null as StreamResponse | null,
    },
    getStream: async (_movieType: "movie" | "tv", _movieId: string, _seasonId?: string, _episodeId?: string) => { },
})

export const useStream = () => useContext(StreamContext);

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
    const [getStreamData, setGetStreamData] = useState<{
        isLoading: boolean;
        isAvailable: boolean;
        data: StreamResponse | null;
    }>({
        isLoading: false,
        isAvailable: false,
        data: null,
    });

    const getStream = async (movieType: "movie" | "tv", movieId: string, seasonId?: string, episodeId?: string) => {
        try {
            setGetStreamData({ isLoading: true, isAvailable: false, data: null });
            const response = await stream.getStream(movieType == "tv" ? "series" : "movie", movieId, seasonId, episodeId);
            if (response?.streams && response?.streams.length > 0) {
                setGetStreamData({ isLoading: false, isAvailable: true, data: response as StreamResponse });
            } else {
                setGetStreamData({ isLoading: false, isAvailable: false, data: null });
            }
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