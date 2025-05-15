import { ArrowBackIos } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Option,
  Select,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import { useTMDB } from "../../context/TMDB";
import { useEffect } from "react";
import {
  addToRecentlyWatched,
  backdropLoading,
} from "../../utilities/defaults";
import NotFound from "../../components/utils/NotFound";
import { movieDetails, tvDetails, tvSeasonsDetails } from "../../tmdb-res";

function Watch() {
  const {
    tvSeriesDetailsData,
    tvSeries,
    movieDetailsData,
    movie,
    tvSeasonsDetails,
    tvSeasonsDetailsData,
  } = useTMDB();
  const { movieId, movieType, seasonId, episodeId } = useParams();
  const { colorScheme } = useColorScheme();
  const navigate = useNavigate();

  const isTvSE = seasonId && episodeId;
  const isFetching =
    tvSeriesDetailsData?.isLoading ||
    movieDetailsData?.isLoading ||
    tvSeasonsDetailsData?.isLoading;
  const isIncorrect =
    tvSeriesDetailsData?.isIncorrect || movieDetailsData?.isIncorrect;
  const tvSeriesDetailsDataArr = tvSeriesDetailsData?.data as tvDetails;
  const movieDetailsDataArr = movieDetailsData?.data as movieDetails;
  const tvSeasonsDetailsArr = tvSeasonsDetailsData?.data as tvSeasonsDetails;

  useEffect(() => {
    if (movieType === "movie" && movieId) {
      movie(movieId);
    } else if (movieType === "tv" && movieId) {
      tvSeries(movieId);
      if (seasonId) {
        tvSeasonsDetails(movieId, parseInt(seasonId));
      }
    }
  }, [movieType, movieId, seasonId]);

  useEffect(() => {
    if (
      (movieId && movieType && movieDetailsDataArr) ||
      tvSeriesDetailsDataArr
    ) {
      addToRecentlyWatched({
        id: movieId!,
        type: movieType!,
        poster:
          movieDetailsDataArr?.poster_path ||
          tvSeriesDetailsDataArr?.poster_path,
      });
    }
  }, [movieId, movieType, movieDetailsDataArr, tvSeriesDetailsDataArr]);
  return isIncorrect ? (
    <NotFound />
  ) : isFetching ? (
    <Box width={"100%"} height={"100vh"}>
      {backdropLoading(true, colorScheme)}
    </Box>
  ) : (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        height: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1001,
          width: "100%",
          height: "50px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <IconButton onClick={() => navigate(`/${movieType}/${movieId}`)}>
          <ArrowBackIos />
        </IconButton>
        <Typography level="title-lg" sx={{ margin: "0 auto" }}>
          {movieType === "movie" ? (
            movieDetailsDataArr?.title
          ) : (
            <>
              {tvSeriesDetailsDataArr?.name} - S{seasonId}:E{episodeId}(
              {
                tvSeasonsDetailsArr?.episodes.filter(
                  (e) => e.episode_number == parseInt(episodeId!)
                )[0]?.name
              }
              )
            </>
          )}
        </Typography>
      </Box>
      <Box
        sx={{
          position: "relative",
          top: "55px",
          left: "10px",
          zIndex: 1001,
        }}
      >
        {movieType == "tv" ? (
          <Box sx={{ display: "flex", gap: "5px" }}>
            <Select
              value={parseInt(seasonId!)}
              defaultValue={parseInt(seasonId!)}
              onChange={(_e, v) => {
                navigate(`/${movieType}/${movieId}/${v}/1/watch`);
              }}
            >
              {tvSeriesDetailsDataArr?.seasons
                ?.filter((s) => s?.season_number !== 0)
                .map((s) => (
                  <Option key={s?.id} value={s?.season_number}>
                    {s?.name}
                  </Option>
                ))}
            </Select>
            <Select
              onChange={(_e, v) => {
                navigate(`/${movieType}/${movieId}/${seasonId}/${v}/watch`);
              }}
              defaultValue={parseInt(episodeId!)}
              value={parseInt(episodeId!)}
            >
              {tvSeasonsDetailsArr?.episodes?.map((e) => (
                <Option key={e?.id} value={e?.episode_number}>
                  E{e?.episode_number}: {e?.name}
                </Option>
              ))}
            </Select>
          </Box>
        ) : (
          ""
        )}
      </Box>
      <iframe
        src={`https://vidsrc.cc/v2/embed/${movieType}/${movieId}${
          isTvSE ? `/${seasonId}` : ""
        }${
          isTvSE ? `/${episodeId}` : ""
        }?autoPlay=true&fullScreen=true&mute=false`}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "5px",
          position: "absolute",
          top: 0,
          zIndex: 1000,
        }}
      ></iframe>
    </Box>
  );
}

export default Watch;
