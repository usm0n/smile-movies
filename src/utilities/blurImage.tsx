import React from "react";

interface BlurImageProps {
  lowQualitySrc: string;
  highQualitySrc: string;
  className?: string;
  style?: React.CSSProperties | Record<string, any>;
  eager?: boolean;
}

const BlurImage = ({
  lowQualitySrc,
  highQualitySrc,
  className,
  style,
  eager = false,
}: BlurImageProps) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [src, setSrc] = React.useState(lowQualitySrc);
  const [shouldLoadHighRes, setShouldLoadHighRes] = React.useState(eager);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (eager) {
      setShouldLoadHighRes(true);
      return;
    }

    if (typeof window === "undefined" || !imgRef.current) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoadHighRes(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoadHighRes(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "240px",
      },
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [eager, lowQualitySrc, highQualitySrc]);

  React.useEffect(() => {
    setSrc(lowQualitySrc);
    setIsLoading(true);
  }, [lowQualitySrc]);

  React.useEffect(() => {
    if (!shouldLoadHighRes) return;

    let cancelled = false;
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      if (cancelled) return;
      setSrc(highQualitySrc);
      setIsLoading(false);
    };
    img.onerror = () => {
      if (cancelled) return;
      setIsLoading(false);
    };

    return () => {
      cancelled = true;
    };
  }, [shouldLoadHighRes, highQualitySrc]);

  return (
    <img
      ref={imgRef}
      src={src}
      className={className || ""}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{
        ...style,
        filter: isLoading ? "blur(5px)" : "none",
        transition: "filter 0.3s ease-in-out",
      }}
    />
  );
};

export default BlurImage;
