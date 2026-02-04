import { Box, CircularProgress } from "@mui/joy";

export let isLoggedIn = false;
export const setIsLoggedIn = (value: boolean) => {
  isLoggedIn = value;
};

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
    email,
  );

export const backdropLoading = (open: boolean | undefined, theme: any) =>
  open && (
    <Box>
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

export const ageCount = (birthDate: string, deathDate?: string) => {
  const birth = new Date(birthDate);
  const death = deathDate ? new Date(deathDate) : new Date();
  let age = death.getFullYear() - birth.getFullYear();
  const m = death.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && death.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export const smartText = (text: string) => {
  const newText =
    text.charAt(0).toUpperCase() + text.slice(1).replace(/([A-Z])/g, " $1");
  return newText;
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
      ua,
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
export const deviceBrowser = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown";

  if (ua.indexOf("Chrome") > -1) {
    browser = "Chrome";
  } else if (ua.indexOf("Firefox") > -1) {
    browser = "Firefox";
  } else if (ua.indexOf("Safari") > -1) {
    browser = "Safari";
  } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
    browser = "Internet Explorer";
  } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
    browser = "Opera";
  }

  return browser;
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
  const date = new Date(
    dateString?.replace(
      /(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/,
      "$3-$2-$1T$4:$5",
    ),
  );
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return "now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return `yesterday at ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } else {
    return dateString;
  }
}

export const trackEvent = (
  action: string,
  params: Record<string, any> = {},
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
};
