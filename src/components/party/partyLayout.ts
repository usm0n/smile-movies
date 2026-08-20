/**
 * How the room is arranged on screen.
 *
 * One arrangement does not fit every party. Watching a film with the lights off
 * wants the picture edge to edge and the faces out of the way; three friends
 * catching up over a sitcom want to see each other as much as the show. So the
 * choice belongs to the viewer, and it is remembered — nobody wants to set it
 * again every episode.
 */

export type PartyLayout = "spotlight" | "theater" | "grid" | "cinema";

export const PARTY_LAYOUTS: {
  id: PartyLayout;
  label: string;
  description: string;
}[] = [
  {
    id: "spotlight",
    label: "Spotlight",
    description: "Full-screen video, faces floating beside it",
  },
  {
    id: "theater",
    label: "Theatre",
    description: "Video on top, everyone in a row underneath",
  },
  {
    id: "grid",
    label: "Equal grid",
    description: "The video and every camera the same size",
  },
  {
    id: "cinema",
    label: "Video only",
    description: "Faces hidden — voices still come through",
  },
];

const STORAGE_KEY = "watch-party:layout";

export const readPartyLayout = (): PartyLayout => {
  if (typeof window === "undefined") return "spotlight";
  const stored = window.localStorage.getItem(STORAGE_KEY) || "";
  return PARTY_LAYOUTS.some((layout) => layout.id === stored)
    ? (stored as PartyLayout)
    : "spotlight";
};

export const writePartyLayout = (layout: PartyLayout) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, layout);
};

/** Height of the camera strip in theatre mode. */
export const THEATER_STRIP_PX = 148;

/**
 * Where the video sits, as a CSS inset.
 *
 * The `<video>` is absolutely positioned over the whole player and letterboxed
 * inside whatever box it is given, so every layout is a matter of shrinking
 * that box and filling the space around it. Nothing is reparented, which is why
 * the arrangement survives going fullscreen — the alternative, laying this out
 * at page level, loses the cameras the moment the film fills the screen.
 */
export const videoInsetFor = (
  layout: PartyLayout,
  tileCount: number,
): string => {
  if (layout === "theater" && tileCount > 0) {
    return `0px 0px ${THEATER_STRIP_PX}px 0px`;
  }

  if (layout === "grid" && tileCount > 0) {
    const { columns, rows } = gridShape(tileCount + 1);
    // The video takes the first cell; the cameras fill the rest.
    return `0px ${((columns - 1) / columns) * 100}% ${
      ((rows - 1) / rows) * 100
    }% 0px`;
  }

  return "0px";
};

/** The tightest grid that fits `cells` items without stranding a whole row. */
export const gridShape = (cells: number): { columns: number; rows: number } => {
  const columns = Math.max(1, Math.ceil(Math.sqrt(cells)));
  return { columns, rows: Math.max(1, Math.ceil(cells / columns)) };
};
