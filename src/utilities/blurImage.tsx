import React from "react";

interface BlurImageProps {
  lowQualitySrc: string;
  highQualitySrc: string;
  className?: string;
  style?: React.CSSProperties;
}

const BlurImage = ({
  lowQualitySrc,
  highQualitySrc,
  className,
  style,
}: BlurImageProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [src, setSrc] = React.useState(lowQualitySrc);

  React.useEffect(() => {
    setSrc(lowQualitySrc);
    setIsLoading(true);
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoading(false);
    };
  }, [lowQualitySrc, highQualitySrc]);

  return (
    <img
      src={src}
      className={className || ""}
      style={{
        ...style,
        filter: isLoading ? "blur(20px)" : "none",
        transition: "filter 0.3s ease-in-out",
      }}
    />
  );
};

export default BlurImage;
