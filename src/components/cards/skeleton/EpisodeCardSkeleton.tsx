import { Card, Skeleton } from "@mui/joy";

function EpisodeCardSkeleton() {
  return (
    <Card
      sx={{
        border: "none",
      }}
    >
      <Skeleton width={270} height={150} variant="rectangular" />
      <Skeleton width={70} height={15} variant="text"/>
      <Skeleton width={270} height={15} variant="text"/>
      <Skeleton width={270} height={15} variant="text"/>
      <Skeleton width={130} height={15} variant="text"/>
    </Card>
  );
}

export default EpisodeCardSkeleton;
