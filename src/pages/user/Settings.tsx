import {
  Box,
  Button,
  Card,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { ResponseType, User } from "../../user";
import { Edit, Visibility, VisibilityOff } from "@mui/icons-material";
import { isValidEmail } from "../../utilities/defaults";
import { useState } from "react";

function Settings({
  userValue,
  updatedMyselfData,
  setUserValue,
  myselfData,
  updateMyself
}: {
  userValue: User;
  updatedMyselfData: any;
  setUserValue: React.Dispatch<React.SetStateAction<User>>;
  myselfData: ResponseType | null;
  updateMyself: (user: User) => void;
}) {
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);

  // const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setPasswords((prevPassword) => ({
  //     ...prevPassword,
  //     [name]: value,
  //   }));
  // };
  // const [passwords, setPasswords] = useState({
  //   oldPassword: "",
  //   password: "",
  //   cpassword: "",
  // });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
  };
  return (
    <Card
      sx={{
        width: "700px",
        margin: "0 auto",
        "@media (max-width: 800px)": {
          width: "90%",
        },
      }}
    >
      <Typography level="h4">Settings</Typography>
      <Divider />
      <FormControl>
        <FormLabel>Firstname</FormLabel>
        <Input
          required
          name="firstname"
          placeholder="Your firstname"
          value={userValue?.firstname}
          onChange={handleInput}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Lastname</FormLabel>
        <Input
          name="lastname"
          placeholder="Your lastname"
          value={userValue?.lastname}
          onChange={handleInput}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          required
          name="email"
          placeholder="Your email"
          disabled
          value={userValue?.email}
        />
        {userValue?.loginType !== "google" && (
          <IconButton
            onClick={() => setEmailModal(true)}
            sx={{
              position: "absolute",
              top: "25px",
              right: "0px",
            }}
          >
            <Edit />
          </IconButton>
        )}
      </FormControl>
      {userValue?.loginType !== "google" && (
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            required
            type="password"
            placeholder="Your password"
            disabled
            value={"*********"}
          />
          {/* <IconButton
                    onClick={() => setPasswordModal(true)}
                    sx={{
                      position: "absolute",
                      top: "25px",
                      right: "0px",
                    }}
                  >
                    <Edit />
                  </IconButton> */}
        </FormControl>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingTop: "20px",
        }}
      >
        <Button
          type="submit"
          disabled={
            updatedMyselfData?.isLoading || !userValue?.firstname.trim()
          }
          sx={{
            background: "rgb(255, 200, 0)",
            ":hover": {
              background: "rgb(255, 200, 0)",
              opacity: 0.8,
            },
          }}
        >
          {updatedMyselfData?.isLoading ? "Updating..." : "Update"}
        </Button>
      </Box>
      <Modal
        open={emailModal}
        onClose={() => {
          setEmailModal(false);
          setUserValue({
            ...userValue,
            email: (myselfData?.data as User).email,
          });
        }}
      >
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Email Change</DialogTitle>
          <FormHelperText>
            Note: if you update your email address you gotta verify your new
            email address
          </FormHelperText>
          <Divider />
          <DialogContent sx={{ gap: "20px" }}>
            <FormControl
              color={updatedMyselfData?.isConflict ? "danger" : "neutral"}
            >
              <FormLabel>Email</FormLabel>
              <Input
                value={userValue?.email}
                name="email"
                onChange={handleInput}
                required
              />
              <FormHelperText>
                {updatedMyselfData?.isConflict && "Email is already taken"}
              </FormHelperText>
              <FormHelperText>
                {!isValidEmail(userValue?.email) && "Email is invalid"}
              </FormHelperText>
            </FormControl>
            <Button
              disabled={
                updatedMyselfData?.isLoading ||
                userValue?.email == (myselfData?.data as User)?.email ||
                !isValidEmail(userValue?.email)
              }
              type="submit"
              onClick={() => {
                updateMyself(userValue);
              }}
            >
              {updatedMyselfData?.isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogContent>
        </ModalDialog>
      </Modal>
      <Modal
        open={passwordModal}
        onClose={() => {
          setPasswordModal(false);
          // setPasswords({
          //   oldPassword: "",
          //   password: "",
          //   cpassword: "",
          // });
          setUserValue({
            ...userValue,
            password: (myselfData?.data as User).password,
          });
        }}
      >
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Password Change</DialogTitle>
          <Divider />
          <DialogContent>
            <FormControl color={"neutral"}>
              <FormLabel>Old Password</FormLabel>
              <Input
                name="oldPassword"
                // onChange={handlePasswordInput}
                endDecorator={
                  <IconButton
                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                  >
                    {passwordVisibility ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
                placeholder="Your Password"
                type={passwordVisibility ? "text" : "password"}
              />
            </FormControl>
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Card>
  );
}

export default Settings;
