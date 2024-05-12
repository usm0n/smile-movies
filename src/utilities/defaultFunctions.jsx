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