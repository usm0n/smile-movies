import { createContext } from "react";

const WatchLaterContext = createContext({
    watchLaterMovies: [],
    setWatchLaterMovies: () => {}
})