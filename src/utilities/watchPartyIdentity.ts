/**
 * Who a guest is, from one visit to the next.
 *
 * A watch-party link has to work for someone with no account — that is the
 * whole point of handing it to a friend. They still need a stable identity, or
 * a refresh mid-film reads as one person leaving and a stranger arriving, and
 * the member list fills with ghosts. The id is generated once and kept in local
 * storage; the name is whatever they typed the first time they were asked, so
 * they are only asked once.
 */

const PID_KEY = "watch-party:pid";
const NAME_KEY = "watch-party:name";

export const readGuestPid = (): string => {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(PID_KEY) || "";
  if (/^g_[a-z0-9]{6,32}$/i.test(existing)) return existing;

  const pid = `g_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(PID_KEY, pid);
  return pid;
};

export const readGuestName = (): string => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NAME_KEY) || "";
};

export const writeGuestName = (name: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAME_KEY, name.trim().slice(0, 30));
};
