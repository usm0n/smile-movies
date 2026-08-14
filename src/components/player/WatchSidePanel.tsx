import { ReactNode, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/joy";
import { useMediaRemote } from "@vidstack/react";
import { Check, Close, Loader, PlayArrow } from "../ui/icons";
import { AnimeMode, ProviderId, VixsrcSourceOption } from "../../types/providers";

export type WatchPanelTab = "episodes" | "sources" | "info";

type SeasonOption = {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
};

type EpisodeOption = {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  runtime: number;
  still_path: string;
  air_date: string;
};

export type ProviderOption = {
  id: ProviderId;
  label: string;
  description: string;
  /** Marks the provider the title is best served by (AnimeKai for anime). */
  recommended?: boolean;
};

export type WatchSidePanelProps = {
  open: boolean;
  tab: WatchPanelTab;
  onTabChange: (tab: WatchPanelTab) => void;
  onClose: () => void;
  showEpisodes: boolean;
  seasons: SeasonOption[];
  episodes: EpisodeOption[];
  isEpisodesLoading?: boolean;
  currentSeason: number;
  currentEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeSelect: (episode: number) => void;
  providers: ProviderOption[];
  selectedProvider: ProviderId;
  onProviderChange: (provider: ProviderId) => void;
  sources: VixsrcSourceOption[];
  activeSourceId: string;
  onSourceChange: (sourceId: string) => void;
  isSourcesLoading?: boolean;
  showVersion: boolean;
  version: AnimeMode;
  onVersionChange: (version: AnimeMode) => void;
  notice?: string;
  /** Rendered under the Info tab — the page owns what "info" means. */
  infoContent?: ReactNode;
};

const formatRuntime = (minutes: number) =>
  Number(minutes) > 0 ? `${Math.round(Number(minutes))} min` : "";

function PanelTab({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      sx={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "body",
        fontSize: "0.875rem",
        fontWeight: 500,
        color: selected ? "#ededed" : "#707070",
        px: 1.5,
        py: 1.25,
        borderBottom: "2px solid",
        borderBottomColor: selected ? "#ededed" : "transparent",
        marginBottom: "-1px",
        transition: "color 150ms ease, border-color 150ms ease",
        "&:hover": { color: "#ededed" },
      }}
    >
      {label}
    </Box>
  );
}

function OptionRow({
  title,
  hint,
  selected,
  badge,
  onClick,
}: {
  title: string;
  hint?: string;
  selected: boolean;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        width: "100%",
        px: 1.5,
        py: 1.25,
        textAlign: "left",
        cursor: "pointer",
        borderRadius: "8px",
        border: "1px solid",
        borderColor: selected ? "#333333" : "#1f1f1f",
        backgroundColor: selected ? "#111111" : "transparent",
        color: "#ededed",
        fontFamily: "body",
        transition: "background-color 150ms ease, border-color 150ms ease",
        "&:hover": { backgroundColor: "#111111", borderColor: "#333333" },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <Box
            component="span"
            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {title}
          </Box>
          {badge ? (
            <Box
              component="span"
              sx={{
                px: 0.75,
                py: "1px",
                borderRadius: "4px",
                border: "1px solid #1f1f1f",
                backgroundColor: "#111111",
                fontSize: "0.6875rem",
                fontWeight: 500,
                color: "#a1a1a1",
                flexShrink: 0,
              }}
            >
              {badge}
            </Box>
          ) : null}
        </Box>
        {hint ? (
          <Typography level="body-xs" sx={{ mt: 0.25 }}>
            {hint}
          </Typography>
        ) : null}
      </Box>
      {selected ? <Check sx={{ fontSize: 16, flexShrink: 0 }} /> : null}
    </Box>
  );
}

/**
 * Episodes and sources, as a sheet that slides in over the video.
 *
 * These used to be three dropdowns floating in the middle of the picture. They
 * live here instead: on the right edge, above the video, closed by default, and
 * — crucially — inside `<media-player>`, so they are still visible when the
 * viewer is in fullscreen.
 */
function WatchSidePanel({
  open,
  tab,
  onTabChange,
  onClose,
  showEpisodes,
  seasons,
  episodes,
  isEpisodesLoading,
  currentSeason,
  currentEpisode,
  onSeasonChange,
  onEpisodeSelect,
  providers,
  selectedProvider,
  onProviderChange,
  sources,
  activeSourceId,
  onSourceChange,
  isSourcesLoading,
  showVersion,
  version,
  onVersionChange,
  notice,
  infoContent,
}: WatchSidePanelProps) {
  const remote = useMediaRemote();
  const activeEpisodeRef = useRef<HTMLDivElement | null>(null);

  // Hold the controls open while the sheet is — the chrome fading out beneath
  // an open panel reads as the player having crashed.
  useEffect(() => {
    if (!open) return;
    remote.pauseUserIdle();
    return () => remote.resumeUserIdle();
  }, [open, remote]);

  useEffect(() => {
    if (!open || tab !== "episodes") return;
    activeEpisodeRef.current?.scrollIntoView({ block: "center" });
  }, [open, tab, episodes.length]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <Box
        onClick={onClose}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 8,
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      />
      <Box
        role="dialog"
        aria-label={
          tab === "episodes" ? "Episodes" : tab === "info" ? "Info" : "Sources"
        }
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9,
          width: { xs: "100%", sm: "min(420px, 92%)" },
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(10,10,10,0.96)",
          backdropFilter: "blur(16px)",
          borderLeft: "1px solid #1f1f1f",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.6)",
          animation: "sm-panel-in 200ms ease",
          "@keyframes sm-panel-in": {
            from: { transform: "translateX(24px)", opacity: 0 },
            to: { transform: "translateX(0)", opacity: 1 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            px: 1,
            borderBottom: "1px solid #1f1f1f",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }} role="tablist">
            {showEpisodes ? (
              <PanelTab
                label="Episodes"
                selected={tab === "episodes"}
                onClick={() => onTabChange("episodes")}
              />
            ) : null}
            <PanelTab
              label="Sources"
              selected={tab === "sources"}
              onClick={() => onTabChange("sources")}
            />
            {infoContent ? (
              <PanelTab
                label="Info"
                selected={tab === "info"}
                onClick={() => onTabChange("info")}
              />
            ) : null}
          </Box>
          <Box
            component="button"
            type="button"
            aria-label="Close panel"
            onClick={onClose}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              mr: 0.5,
              border: "none",
              borderRadius: "6px",
              background: "transparent",
              color: "#a1a1a1",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#111111", color: "#ededed" },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1.5 }}>
          {tab === "episodes" && showEpisodes ? (
            <>
              <Box
                className="no-scrollbar"
                sx={{
                  display: "flex",
                  gap: 0.5,
                  overflowX: "auto",
                  pb: 1.5,
                  mb: 0.5,
                }}
              >
                {seasons.map((season) => (
                  <Box
                    key={season.id}
                    component="button"
                    type="button"
                    onClick={() => onSeasonChange(season.season_number)}
                    sx={{
                      flexShrink: 0,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: "6px",
                      border: "1px solid",
                      borderColor:
                        season.season_number === currentSeason ? "#333333" : "#1f1f1f",
                      backgroundColor:
                        season.season_number === currentSeason ? "#1a1a1a" : "transparent",
                      color:
                        season.season_number === currentSeason ? "#ededed" : "#a1a1a1",
                      fontFamily: "body",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      "&:hover": { color: "#ededed", borderColor: "#333333" },
                    }}
                  >
                    {season.name}
                  </Box>
                ))}
              </Box>

              {isEpisodesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <Loader
                    sx={{
                      fontSize: 24,
                      color: "#707070",
                      animation: "sm-spin 900ms linear infinite",
                      "@keyframes sm-spin": { to: { transform: "rotate(360deg)" } },
                    }}
                  />
                </Box>
              ) : null}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {episodes.map((episode) => {
                  const isActive = episode.episode_number === currentEpisode;
                  return (
                    <Box
                      key={episode.id}
                      ref={isActive ? activeEpisodeRef : undefined}
                      component="button"
                      type="button"
                      onClick={() => onEpisodeSelect(episode.episode_number)}
                      sx={{
                        display: "flex",
                        gap: 1.25,
                        alignItems: "flex-start",
                        width: "100%",
                        p: 1,
                        textAlign: "left",
                        cursor: "pointer",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: isActive ? "#333333" : "transparent",
                        backgroundColor: isActive ? "#111111" : "transparent",
                        transition: "background-color 150ms ease, border-color 150ms ease",
                        "&:hover": { backgroundColor: "#111111" },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: 108,
                          flexShrink: 0,
                          aspectRatio: "16 / 9",
                          borderRadius: "6px",
                          overflow: "hidden",
                          backgroundColor: "#111111",
                          border: "1px solid #1f1f1f",
                        }}
                      >
                        {episode.still_path ? (
                          <Box
                            component="img"
                            loading="lazy"
                            src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                            alt=""
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : null}
                        {isActive ? (
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "rgba(0,0,0,0.55)",
                              color: "#ffffff",
                            }}
                          >
                            <PlayArrow sx={{ fontSize: 20 }} strokeWidth={2} />
                          </Box>
                        ) : null}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          level="title-sm"
                          sx={{
                            color: isActive ? "#ededed" : "#cccccc",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {episode.episode_number}. {episode.name}
                        </Typography>
                        <Typography level="body-xs" sx={{ mt: 0.25 }}>
                          {[formatRuntime(episode.runtime), episode.air_date]
                            .filter(Boolean)
                            .join(" · ")}
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{
                            mt: 0.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {episode.overview}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </>
          ) : tab === "info" && infoContent ? (
            infoContent
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  level="body-xs"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  Provider
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {providers.map((provider) => (
                    <OptionRow
                      key={provider.id}
                      title={provider.label}
                      hint={provider.description}
                      badge={provider.recommended ? "Recommended" : undefined}
                      selected={provider.id === selectedProvider}
                      onClick={() => onProviderChange(provider.id)}
                    />
                  ))}
                </Box>
              </Box>

              {showVersion ? (
                <Box>
                  <Typography
                    level="body-xs"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    Audio
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {(["sub", "dub"] as AnimeMode[]).map((option) => (
                      <Box
                        key={option}
                        component="button"
                        type="button"
                        onClick={() => onVersionChange(option)}
                        sx={{
                          flex: 1,
                          py: 1,
                          borderRadius: "6px",
                          border: "1px solid",
                          borderColor: option === version ? "#333333" : "#1f1f1f",
                          backgroundColor: option === version ? "#1a1a1a" : "transparent",
                          color: option === version ? "#ededed" : "#a1a1a1",
                          fontFamily: "body",
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          "&:hover": { color: "#ededed", borderColor: "#333333" },
                        }}
                      >
                        {option === "sub" ? "Subbed" : "Dubbed"}
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : null}

              <Box>
                <Typography
                  level="body-xs"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                    mb: 1,
                  }}
                >
                  Server
                </Typography>
                {isSourcesLoading ? (
                  <Typography level="body-sm">Finding servers…</Typography>
                ) : sources.length ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {sources.map((source) => (
                      <OptionRow
                        key={source.id}
                        title={source.name}
                        hint={[source.quality, source.format?.toUpperCase()]
                          .filter(Boolean)
                          .join(" · ")}
                        selected={source.id === activeSourceId}
                        onClick={() => onSourceChange(source.id)}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography level="body-sm">
                    No servers reported for this provider yet.
                  </Typography>
                )}
              </Box>

              {notice ? (
                <Typography
                  level="body-xs"
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: "8px",
                    border: "1px solid #1f1f1f",
                    backgroundColor: "#111111",
                    color: "#f5a623",
                  }}
                >
                  {notice}
                </Typography>
              ) : null}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export default WatchSidePanel;
