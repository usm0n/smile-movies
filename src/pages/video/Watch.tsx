import { useParams } from "react-router-dom";

function Watch() {
  const { movieId, movieType } = useParams();
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
        zIndex: 1000,
      }}
    ></iframe>
  );
}

export default Watch;
