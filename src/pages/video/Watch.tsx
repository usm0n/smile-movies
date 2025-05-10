import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { vidsrc } from "../../service/api/vidsrc/vidsrc.api.service";

function Watch() {
  const { movieId, movieType } = useParams();
  useEffect(() => {
    if (movieType === "movie") {
      const movie = vidsrc.getVideo(movieId!, "movie");
      console.log(movie);
    } else {
      const tv = vidsrc.getVideo(movieId!, "tv", 1, 1);
      console.log(tv);
    }
  }, [movieId, movieType]);
  return (
    <iframe
      src={`https://vidsrc.cc/v2/embed/${movieType}/${movieId}?autoPlay=true&fullScreen=true&mute=false`}
      allowFullScreen
      sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
        borderRadius: "5px",
        position: "absolute",
        top: 0,
      }}
    ></iframe>
  );
}

export default Watch;
