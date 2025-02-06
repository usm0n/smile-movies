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
  return `${hours}h ${minutes}m`;
};

export const ymdToDmy = (date: string) => {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};
