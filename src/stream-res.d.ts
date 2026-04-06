export interface StreamServer {
    name: string;
    title: string;
    url: string;
    type: string;
    availability: number;
    behaviorHints?: {
        notWebReady?: boolean;
        bingeGroup?: string;
        [key: string]: unknown;
    }
}

export interface StreamResponse {
    streams: StreamServer[]
}

export interface StreamEmptyResponse {
    streams: [];
}
