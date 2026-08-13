import { Box } from "@mui/joy";
import type { SxProps } from "@mui/joy/styles/types";

/** A single shimmering block. Everything else here composes it. */
export function Shimmer({
  width = "100%",
  height = 16,
  radius = 6,
  sx,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  sx?: SxProps;
}) {
  return (
    <Box
      className="sm-shimmer"
      sx={{ width, height, borderRadius: radius, flexShrink: 0, ...(sx as object) }}
    />
  );
}

/** Matches the poster cards in the home rows, watchlist and search grids. */
export function PosterSkeleton({ width = 180 }: { width?: number | string }) {
  return (
    <Box sx={{ width, flexShrink: 0 }}>
      <Shimmer width="100%" height={0} sx={{ pb: "150%", height: "auto" }} radius={8} />
      <Shimmer width="70%" height={12} sx={{ mt: 1.25 }} />
      <Shimmer width="40%" height={10} sx={{ mt: 0.75 }} />
    </Box>
  );
}

/** A horizontal row of poster skeletons, used while a TMDB list loads. */
export function RowSkeleton({
  count = 8,
  title = true,
  width = 180,
}: {
  count?: number;
  title?: boolean;
  width?: number;
}) {
  return (
    <Box>
      {title && <Shimmer width={180} height={20} sx={{ mb: 2 }} />}
      <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
        {Array.from({ length: count }).map((_, index) => (
          <PosterSkeleton key={index} width={width} />
        ))}
      </Box>
    </Box>
  );
}

/** Hero / detail-page header placeholder. */
export function DetailSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Shimmer height={360} radius={12} />
      <Shimmer width="45%" height={32} />
      <Shimmer width="80%" height={14} />
      <Shimmer width="60%" height={14} />
    </Box>
  );
}

/** Generic stacked lines, for list rows and text blocks. */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Shimmer
          key={index}
          height={12}
          width={index === lines - 1 ? "55%" : "100%"}
        />
      ))}
    </Box>
  );
}

export default Shimmer;
