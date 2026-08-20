import {
  CELL_METRICS,
  LEGEND,
  Progress,
  ProgressMode,
  RatingsStats,
  SeasonData,
  TIER_COLORS,
  formatVotes,
  getTier,
  progressState,
  ratingOf,
} from "./ratingsShared";
import { fontStack } from "../../../theme";

/**
 * Renders the ratings grid to a PNG.
 *
 * The page's DOM is not screenshotted — the card is drawn from the same data
 * the grid renders from, so the export has its own layout (poster, title
 * block, legend, footer) and doesn't inherit whatever the viewport happened
 * to be showing. Everything is laid out in logical pixels and the canvas is
 * scaled by `SCALE` so the file is crisp on retina displays and in Telegram.
 */

const SCALE = 2;
const PAD = 44;
const POSTER_W = 116;
const POSTER_H = 174;
const HEADER_H = POSTER_H;
const LEGEND_H = 52;
const FOOTER_H = 56;
// Wide enough that the seven-tier legend never wraps off the right edge.
const MIN_WIDTH = 980;

const BG = "#08080a";
const SURFACE = "#101013";
const BORDER = "#232326";
const TEXT = "#ededed";
const MUTED = "#a1a1a1";
const FAINT = "#6d6d72";
const IMDB_YELLOW = "#F5C518";

export interface RatingsImageOptions {
  title: string;
  meta: string;
  posterUrl: string | null;
  seasons: SeasonData[];
  stats: RatingsStats;
  imdbRating?: number | null;
  progress: Progress;
  nextUp: Progress;
  progressMode: ProgressMode;
  footer: string;
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  // Safari only grew `roundRect` in 16 — the manual path keeps older ones working.
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}…`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  return `${clipped}…`;
}

function pill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color: string,
  background: string,
) {
  ctx.font = `600 13px ${fontStack}`;
  const width = ctx.measureText(label).width + 22;
  roundRect(ctx, x, y, width, 26, 6);
  ctx.fillStyle = background;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + 11, y + 14);
  return width + 8;
}

function draw(
  options: RatingsImageOptions,
  poster: HTMLImageElement | null,
): HTMLCanvasElement {
  const { seasons, stats } = options;
  const metric = CELL_METRICS.normal;
  const maxEpisodes = seasons.reduce(
    (highest, season) => Math.max(highest, season.order.length),
    0,
  );

  const gridWidth =
    metric.label + seasons.length * (metric.width + metric.gap) - metric.gap;
  const rowHeight = metric.height + metric.gap;
  // Season header row + episode rows + spacer + average row + "AVG" caption.
  const gridHeight = rowHeight * (maxEpisodes + 1) + metric.height + 26;

  const width = Math.max(MIN_WIDTH, PAD * 2 + gridWidth);
  const height =
    PAD + HEADER_H + 28 + LEGEND_H + gridHeight + FOOTER_H + PAD;

  const canvas = document.createElement("canvas");
  canvas.width = width * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";

  // Background: flat black with one soft highlight so it isn't a dead rectangle.
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width * 0.18, 0, 0, width * 0.18, 0, width * 0.7);
  glow.addColorStop(0, "rgba(245,197,24,0.10)");
  glow.addColorStop(1, "rgba(245,197,24,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height * 0.5);

  // ── Header ──
  let textX = PAD;
  if (poster) {
    ctx.save();
    roundRect(ctx, PAD, PAD, POSTER_W, POSTER_H, 10);
    ctx.clip();
    ctx.drawImage(poster, PAD, PAD, POSTER_W, POSTER_H);
    ctx.restore();
    roundRect(ctx, PAD + 0.5, PAD + 0.5, POSTER_W - 1, POSTER_H - 1, 10);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    ctx.stroke();
    textX = PAD + POSTER_W + 26;
  }

  const textWidth = width - textX - PAD;

  ctx.fillStyle = IMDB_YELLOW;
  ctx.font = `700 12px ${fontStack}`;
  ctx.letterSpacing = "0.14em";
  ctx.fillText("IMDB EPISODE RATINGS", textX, PAD + 16);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = TEXT;
  ctx.font = `700 36px ${fontStack}`;
  ctx.fillText(ellipsize(ctx, options.title, textWidth), textX, PAD + 60);

  ctx.fillStyle = MUTED;
  ctx.font = `400 15px ${fontStack}`;
  ctx.fillText(ellipsize(ctx, options.meta, textWidth), textX, PAD + 88);

  let pillX = textX;
  const pillY = PAD + 106;
  if (options.imdbRating) {
    pillX += pill(
      ctx,
      pillX,
      pillY,
      `IMDb ${options.imdbRating.toFixed(1)}`,
      IMDB_YELLOW,
      "rgba(245,197,24,0.12)",
    );
  }
  if (stats.average > 0) {
    pillX += pill(
      ctx,
      pillX,
      pillY,
      `Episode avg ${stats.average.toFixed(1)}`,
      TIER_COLORS[getTier(stats.average)].border,
      "rgba(255,255,255,0.04)",
    );
  }
  pillX += pill(
    ctx,
    pillX,
    pillY,
    `${stats.ratedCount} rated episodes`,
    MUTED,
    "rgba(255,255,255,0.04)",
  );
  if (stats.totalVotes > 0) {
    pill(
      ctx,
      pillX,
      pillY,
      `${formatVotes(stats.totalVotes)} votes`,
      MUTED,
      "rgba(255,255,255,0.04)",
    );
  }

  if (stats.best) {
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = FAINT;
    ctx.font = `400 13px ${fontStack}`;
    const line = `Best: S${stats.best.season}:E${stats.best.episode} ${stats.best.title} · ${stats.best.rating.toFixed(1)}`;
    ctx.fillText(ellipsize(ctx, line, textWidth), textX, PAD + POSTER_H - 4);
  }

  // ── Legend ──
  const legendY = PAD + HEADER_H + 28;
  roundRect(ctx, PAD, legendY - 18, width - PAD * 2, 40, 8);
  ctx.fillStyle = SURFACE;
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  let legendX = PAD + 14;
  ctx.textBaseline = "middle";
  LEGEND.forEach((item) => {
    const color = TIER_COLORS[item.tier];
    roundRect(ctx, legendX, legendY - 4, 11, 11, 3);
    ctx.fillStyle = color.bg;
    ctx.fill();
    legendX += 17;

    ctx.font = `500 12px ${fontStack}`;
    ctx.fillStyle = color.text;
    ctx.fillText(item.label, legendX, legendY + 2);
    legendX += ctx.measureText(item.label).width + 6;

    ctx.font = `400 12px ${fontStack}`;
    ctx.fillStyle = FAINT;
    ctx.fillText(item.range, legendX, legendY + 2);
    legendX += ctx.measureText(item.range).width + 16;
  });

  // ── Grid ──
  const gridTop = legendY + LEGEND_H;
  const columnX = (index: number) =>
    PAD + metric.label + index * (metric.width + metric.gap);

  ctx.textAlign = "center";
  ctx.font = `700 12px ${fontStack}`;
  seasons.forEach((season, index) => {
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText(
      `S${season.seasonNumber}`,
      columnX(index) + metric.width / 2,
      gridTop + metric.height / 2,
    );
  });

  for (let row = 0; row < maxEpisodes; row += 1) {
    const y = gridTop + rowHeight * (row + 1);

    ctx.textAlign = "right";
    ctx.font = `600 10px ${fontStack}`;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(`E${row + 1}`, PAD + metric.label - 8, y + metric.height / 2);

    ctx.textAlign = "center";
    seasons.forEach((season, index) => {
      const number = season.order[row];
      const x = columnX(index);
      const episode = number ? season.episodes.get(number) : undefined;

      if (!episode) {
        roundRect(ctx, x, y, metric.width, metric.height, 5);
        ctx.fillStyle = "rgba(255,255,255,0.03)";
        ctx.fill();
        return;
      }

      const rating = ratingOf(episode);
      const color = TIER_COLORS[getTier(rating)];
      const state = progressState(
        options.progress,
        options.nextUp,
        season.seasonNumber,
        number,
      );
      const ahead = state === "ahead" || state === "next";
      const hidden = options.progressMode === "spoiler" && ahead;
      const dimmed = options.progressMode === "dim" && ahead;

      ctx.save();
      if (dimmed) ctx.globalAlpha = 0.45;
      roundRect(ctx, x, y, metric.width, metric.height, 5);
      ctx.fillStyle = hidden ? "rgba(255,255,255,0.07)" : color.bg;
      ctx.fill();

      ctx.fillStyle = hidden ? FAINT : color.fg;
      ctx.font = hidden
        ? `600 12px ${fontStack}`
        : `600 13px ${fontStack}`;
      ctx.fillText(
        hidden ? "•" : rating > 0 ? rating.toFixed(1) : "?",
        x + metric.width / 2,
        y + metric.height / 2 + 1,
      );
      ctx.restore();

      if (state === "current") {
        roundRect(ctx, x - 1.5, y - 1.5, metric.width + 3, metric.height + 3, 7);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  // ── Season averages ──
  const averageY = gridTop + rowHeight * (maxEpisodes + 1) + 4;
  seasons.forEach((season, index) => {
    const color = TIER_COLORS[getTier(season.average)];
    const x = columnX(index);
    roundRect(ctx, x, averageY, metric.width, metric.height, 6);
    ctx.fillStyle = color.bg;
    ctx.fill();
    ctx.strokeStyle = color.border;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = color.fg;
    ctx.font = `800 13px ${fontStack}`;
    ctx.fillText(
      season.average > 0 ? season.average.toFixed(1) : "—",
      x + metric.width / 2,
      averageY + metric.height / 2 + 1,
    );
  });

  ctx.textAlign = "right";
  ctx.font = `700 10px ${fontStack}`;
  ctx.fillStyle = FAINT;
  ctx.fillText("AVG", PAD + metric.label - 8, averageY + metric.height / 2);

  // ── Footer ──
  const footerY = height - PAD - 10;
  ctx.beginPath();
  ctx.moveTo(PAD, footerY - 28);
  ctx.lineTo(width - PAD, footerY - 28);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.font = `500 12px ${fontStack}`;
  ctx.fillStyle = FAINT;
  ctx.fillText("Ratings from IMDb", PAD, footerY - 6);

  ctx.textAlign = "right";
  ctx.fillStyle = MUTED;
  ctx.fillText(options.footer, width - PAD, footerY - 6);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  return canvas;
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
        "image/png",
      );
    } catch (error) {
      // A poster served without CORS headers taints the canvas; the caller
      // retries without it rather than failing the whole export.
      reject(error);
    }
  });

export async function renderRatingsImage(
  options: RatingsImageOptions,
): Promise<Blob> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    // Geist is loaded by @fontsource; without this the canvas can fall back
    // to a system face mid-render and the layout measures wrong.
    await document.fonts.ready.catch(() => undefined);
  }

  const poster = options.posterUrl ? await loadImage(options.posterUrl) : null;

  try {
    return await toBlob(draw(options, poster));
  } catch {
    return toBlob(draw(options, null));
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** True when this browser can put a PNG into the native share sheet. */
export function canShareImage(file: File) {
  return Boolean(navigator.canShare?.({ files: [file] }) && navigator.share);
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "series";
