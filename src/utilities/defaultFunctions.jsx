import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";

export const language = !localStorage.getItem("language")
  ? "uz"
  : localStorage.getItem("language").trim();
export const setLanguage = (language) => {
  localStorage.setItem("language", language);

};

export const userId = localStorage.getItem("userId");
export const removeUserId = () => localStorage.removeItem("userId");
export const setUserId = (userId) => {
  localStorage.setItem("userId", userId);
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
  localStorage.removeItem("movieDraft");
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

export const snackbar = (severity, text) => (
  <Snackbar
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
    open={open}
  >
    <Alert severity={severity} variant="filled" sx={{ marginTop: "70px" }}>
      {text}
    </Alert>
  </Snackbar>
);

export const currentYear = new Date().getFullYear();
export const currentMonth = new Date().getMonth();
export const currentDay = new Date().getDate();
export const currentDate = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`;
export const currentTime = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
export const currentDateTime = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
