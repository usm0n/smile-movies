import { Box, CircularProgress } from "@mui/joy";

export function getCookie(cname: string) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
export function setCookie(cname: string, cvalue: string) {
  document.cookie = cname + "=" + cvalue + ";";
  reload();
}
export function deleteCookie(cname: string) {
  document.cookie = cname + "=;";
  reload();
}

export const isLoggedIn = getCookie("authToken").trim() !== "";

export const reload = () => {
  window.location.reload();
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const redirect = (url: string) => {
  window.location.href = url;
};

export const isValidEmail = (email: string) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );

export const backdropLoading = (open: boolean | undefined, theme: any) =>
  open && (
    <Box
      sx={{
        zIndex: 999999999,
        position: "absolute",
        display: "flex",
        width: "100%",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background:
          theme === "dark" ? "rgb(0, 0, 0, 0.5)" : "rgb(255, 255, 255, 0.5)",
      }}
    >
      <CircularProgress value={80} variant="plain" />
    </Box>
  );

export const minuteToHour = (minute: string | number) => {
  const hours = Math.floor(Number(minute) / 60);
  const minutes = Math.floor(Number(minute) % 60);
  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
};

export const ymdToDmy = (date: string) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "short" });
  const year = dateObj.getFullYear();
  return `${month} ${day}, ${year}`;
};

export const smartText = (text: string) => {
  const newText =
    text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, " $1");
  return newText;
};

export const getRecentlyWatched = () => {
  const recentlyWatched = JSON.parse(
    localStorage.getItem("recentlyWatched") || "[]"
  );
  return recentlyWatched;
};

export const addToRecentlyWatched = (item: {
  id: number | string;
  type: "movie" | "tv" | string;
  poster: string;
}) => {
  const recentlyWatched = JSON.parse(
    localStorage.getItem("recentlyWatched") || "[]"
  );
  const exists = recentlyWatched.find((i: { id: number }) => i.id === item.id);
  if (!exists) {
    recentlyWatched.unshift(item);
    localStorage.setItem("recentlyWatched", JSON.stringify(recentlyWatched));
    reload();
  }
};

export const removeFromRecentlyWatched = (id: number | string) => {
  const recentlyWatched = JSON.parse(
    localStorage.getItem("recentlyWatched") || "[]"
  );
  const filtered = recentlyWatched.filter(
    (item: { id: number }) => item.id !== id
  );
  localStorage.setItem("recentlyWatched", JSON.stringify(filtered));
  reload();
};

export const shareLink = async (url: string) => {
  try {
    if (navigator.share) {
      await navigator.share({
        url: url,
      });
    } else {
      window.open(url, "_blank");
    }
  } catch (error) {
    window.open(url, "_blank");
  }
};

export const deviceName = () => {
  const ua = navigator.userAgent;
  let device = "Unknown";

  if (/(Macintosh|MacIntel|MacPPC|Mac68K)/.test(ua)) {
    device = "Mac";
  } else if (/(Win32|Win64|Windows|WinCE)/.test(ua)) {
    device = "Windows";
  } else if (/(Linux)/.test(ua)) {
    device = "Linux";
  } else if (/(iPhone)/.test(ua)) {
    device = "iPhone";
  } else if (/(iPad)/.test(ua)) {
    device = "iPad";
  } else if (/(Android)/.test(ua)) {
    if (/(tablet|Nexus 7)/.test(ua)) {
      device = "Android Tablet";
    } else {
      device = "Android Phone";
    }
  } else if (
    /(TV|SmartTV|SMART-TV|WebTV|HbbTV|AppleTV|Opera TV|POV_TV|BRAVIA|Roku)/.test(
      ua
    )
  ) {
    device = "Smart TV";
  }

  return device;
};

export const deviceType = (): string => {
  const currentDevice = deviceName();
  if (["Mac", "Windows", "Linux"].includes(currentDevice)) {
    return "desktop";
  } else if (["iPhone", "Android Phone"].includes(currentDevice)) {
    return "mobile";
  } else if (["iPad", "Android Tablet"].includes(currentDevice)) {
    return "tablet";
  } else if (currentDevice === "Smart TV") {
    return "tv";
  } else {
    return "unknown";
  }
};
export function deviceId(): string {
  const ua = navigator.userAgent;
  const lang = navigator.language;
  const platform = navigator.platform;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenSize = `${screen.width}x${screen.height}`;

  const raw = `${ua}|${lang}|${platform}|${timezone}|${screenSize}`;
  const hash = btoa(raw);

  return hash;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString?.replace(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/, '$3-$2-$1T$4:$5'));
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return `yesterday at ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return dateString;
  }
}
