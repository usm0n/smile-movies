import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Snackbar } from "@mui/joy";

export const language = !localStorage.getItem("language")
  ? "uz"
  : localStorage.getItem("language").trim();
export const setLanguage = (language) => {
  localStorage.setItem("language", language);
};

export const autoChangeLanguage = () => {
  if (window.location.pathname.endsWith("/uz")) {
    setLanguage("uz");
    window.location.pathname = window.location.pathname.replace("/uz", "");
  } else if (window.location.pathname.endsWith("/ru")) {
    setLanguage("ru");
    window.location.pathname = window.location.pathname.replace("/ru", "");
  } else if (window.location.pathname.endsWith("/en")) {
    setLanguage("en");
    window.location.pathname = window.location.pathname.replace("/en", "");
  }
};

export const userId = localStorage.getItem("userId")
  ? localStorage.getItem("userId")
  : sessionStorage.getItem("userId")
  ? sessionStorage.getItem("userId")
  : undefined;
export const removeUserId = () => {
  localStorage.removeItem("userId");
  sessionStorage.removeItem("userId");
};
export const setLocalUserId = (userId) => {
  localStorage.setItem("userId", userId);
};
export const setSessionUserId = (userId) => {
  sessionStorage.setItem("userId", userId);
};

export const removeLocalDraft = () => {
  localStorage.removeItem("titleDraft uz");
  localStorage.removeItem("titleDraft ru");
  localStorage.removeItem("titleDraft en");
  localStorage.removeItem("notesDraft uz");
  localStorage.removeItem("notesDraft ru");
  localStorage.removeItem("notesDraft en");
  localStorage.removeItem("descriptionDraft uz");
  localStorage.removeItem("descriptionDraft ru");
  localStorage.removeItem("descriptionDraft en");
  localStorage.removeItem("releaseDateDraft day");
  localStorage.removeItem("releaseDateDraft month");
  localStorage.removeItem("releaseDateDraft year");
  localStorage.removeItem("durationDraft hour");
  localStorage.removeItem("durationDraft min");
  localStorage.removeItem("ratingDraft like");
  localStorage.removeItem("ratingDraft dislike");
  localStorage.removeItem("ratingDraft imdb");
  localStorage.removeItem("countryDraft uz");
  localStorage.removeItem("countryDraft ru");
  localStorage.removeItem("countryDraft en");
  localStorage.removeItem("creditDraft uz");
  localStorage.removeItem("creditDraft ru");
  localStorage.removeItem("creditDraft en");
  localStorage.removeItem("imageDraft portrait");
  localStorage.removeItem("imageDraft fullscreen");
  localStorage.removeItem("statusDraft isNew");
  localStorage.removeItem("statusDraft isTrending");
  localStorage.removeItem("statusDraft type");
  localStorage.removeItem("movieDraft uz");
  localStorage.removeItem("movieDraft ru");
  localStorage.removeItem("movieDraft en");
  localStorage.removeItem("trailerDraft");
};

export const dialog = (title, text, open, close, agree) => (
  <Dialog
    open={open}
    onClose={close}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        {text}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>Cancel</Button>
      <Button onClick={agree} autoFocus>
        Ok
      </Button>
    </DialogActions>
  </Dialog>
);

export const formDialog = (
  open,
  close,
  title,
  text,
  type,
  label,
  agree,
  onChange
) => (
  <Dialog open={open} onClose={close}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{text}</DialogContentText>
      <TextField
        onChange={onChange}
        autoFocus
        required
        margin="dense"
        id="name"
        name={type}
        label={label}
        type={type}
        fullWidth
        variant="standard"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={close}>Cancel</Button>
      <Button onClick={agree} type="submit">
        Ok
      </Button>
    </DialogActions>
  </Dialog>
);

export const snackbar = (severity, text) => (
  <Snackbar
    sx={{
      marginTop: "70px",
    }}
    variant="outlined"
    color={severity}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
    open={open}
  >
    {text}
  </Snackbar>
);

export const currentYear = new Date().getFullYear();
export const currentMonth = new Date().getMonth();
export const currentDay = new Date().getDate();
export const currentDate = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`;
export const currentTime = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
export const currentDateTime = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
