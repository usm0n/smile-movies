import {
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Switch,
  TextField,
  styled,
} from "@mui/material";
import { Snackbar } from "@mui/joy";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

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

export const fullSnackbar = (severity, text, open, onClose) => (
  <Snackbar
    sx={{
      marginTop: "70px",
    }}
    variant="outlined"
    color={severity}
    open={open}
    onClose={onClose}
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
    endDecorator={
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    }
  >
    {text}
  </Snackbar>
);

export const currentYear = new Date().getFullYear();
export const currentMonth = new Date().getMonth();
export const currentDay = new Date().getDate();
export const currentDate = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()}`;
export const currentTime = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
export const currentHour = `${new Date().getHours()}`;
export const currentMinute = `${new Date().getMinutes()}`;
export const currentSecond = `${new Date().getSeconds()}`;
export const currentMillisecond = `${new Date().getMilliseconds()}`;
export const currentDateTime = `${new Date().getDate()}.${new Date().getMonth()}.${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;

export const backdropLoading = (open) => (
  <Backdrop
    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={open}
  >
    <CircularProgress color="inherit" />
  </Backdrop>
);

export const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
        opacity: 1,
        border: 0,
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color:
        theme.palette.mode === "light"
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export const isValidEmail = (email) =>
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );

export const backButton = (onclick) => (
  <Button
    onClick={onclick}
    sx={{
      position: "fixed",
      top: "90px",
      left: "20px",
      zIndex: "1000",
      color: "black",
      backgroundColor: "gold",
      borderRadius: "50px",
      transition: "ease-in-out 0.2s",
      "&:hover": {
        backgroundColor: "gold",
        opacity: "0.8",
      },
    }}
  >
    <ArrowBack />
  </Button>
);
