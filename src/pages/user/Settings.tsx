"use client";

import React from "react";
import {
  Box,
  Button,
  Card,
  DialogActions,
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
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
  useColorScheme,
} from "@mui/joy";
import { useUsers } from "../../context/Users";
import { User } from "../../user";
import { useEffect, useState } from "react";
import {
  DeviceUnknown,
  Edit,
  LaptopMac,
  PhoneIphone,
  TabletMac,
  Tv,
  Visibility,
  VisibilityOff,
  WarningRounded,
} from "@mui/icons-material";
import {
  backdropLoading,
  deviceId,
  isLoggedIn,
  isValidEmail,
  smartText,
} from "../../utilities/defaults";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const {
    myselfData,
    updateMyself,
    updatedMyselfData,
    signedInWithGoogle,
  } = useUsers();
  const [userValue, setUserValue] = useState<User>(myselfData?.data as User);
  const [deleteModal, setDeleteModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false);
  // const [passwords, setPasswords] = useState({
  //   oldPassword: "",
  //   password: "",
  //   cpassword: "",
  // });

  const { colorScheme } = useColorScheme();
  const navigate = useNavigate();

  // const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setPasswords((prevPassword) => ({
  //     ...prevPassword,
  //     [name]: value,
  //   }));
  // };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserValue((prevUserData) => ({
      ...prevUserData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (myselfData) {
      setUserValue(myselfData?.data as User);
    }
    if (!isLoggedIn) {
      navigate("/auth/login");
    }
  }, [myselfData]);
  return (
    <form
      onSubmit={(e) => {
        e?.preventDefault();
        updateMyself(userValue);
      }}
    >
      {backdropLoading(myselfData?.isLoading, colorScheme)}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "120vh",
        }}
      >
        <Tabs
          sx={{
            background: "transparent",
          }}
        >
          <TabList>
            <Tab>Settings</Tab>
            <Tab>Devices</Tab>
            <Tab>Privacy Settings</Tab>
          </TabList>
          <TabPanel value={0}>
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
                {!signedInWithGoogle && (
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
              {!signedInWithGoogle && (
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
            </Card>
          </TabPanel>
          <TabPanel value={1}>
            <Card
              sx={{
                width: "700px",
                margin: "0 auto",
                "@media (max-width: 800px)": {
                  width: "90%",
                },
              }}
            >
              <Typography level="h4">Devices</Typography>
              <Card>
                {(myselfData?.data as User)?.devices
                  ?.filter((d) => d.deviceId == deviceId())
                  .map((device) => (
                    <Box
                      key={device.deviceId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <Typography level="h4">
                        {device.deviceType == "mobile" ? (
                          <PhoneIphone />
                        ) : device.deviceType == "desktop" ? (
                          <LaptopMac />
                        ) : device.deviceType == "tablet" ? (
                          <TabletMac />
                        ) : device.deviceType == "tv" ? (
                          <Tv />
                        ) : (
                          <DeviceUnknown />
                        )}
                      </Typography>
                      <Box>
                        <Typography level="h4">
                          {smartText(device.deviceName)}
                        </Typography>
                        <Typography level="body-sm">
                          {smartText(device.deviceType)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Card>
            </Card>
          </TabPanel>
          <TabPanel value={2}>
            <Card
              sx={{
                width: "700px",
                margin: "0 auto",
                "@media (max-width: 800px)": {
                  width: "90%",
                },
              }}
            >
              <Typography level="h4">Privacy Settings</Typography>
              <Box display={"flex"} gap={"10px"} alignItems={"center"}>
                <Typography level="title-md">Created at:</Typography>
                <Typography>{userValue?.createdAt}</Typography>
              </Box>
              <Box display={"flex"} gap={"10px"} alignItems={"center"}>
                <Typography level="title-md">Signed in with:</Typography>
                <Typography>
                  {signedInWithGoogle ? "Google" : "Email & Password"}
                </Typography>
              </Box>
              <Button
                onClick={() => setDeleteModal(true)}
                color="danger"
                variant="outlined"
              >
                Delete account
              </Button>
            </Card>
          </TabPanel>
        </Tabs>
        <Modal open={deleteModal} onClose={() => setDeleteModal(false)}>
          <ModalDialog minWidth={500} variant="outlined" role="alertdialog">
            <DialogTitle>
              <WarningRounded />
              Confirmation
            </DialogTitle>
            <Divider />
            <DialogContent>
              Are you sure you want to delete your account? Remember, this
              cannot be undone!
            </DialogContent>
            <DialogActions>
              <Button
                disabled
                variant="solid"
                color="danger"
                onClick={() => {}}
              >
                Delete my account
              </Button>
              <Button
                variant="plain"
                color="neutral"
                onClick={() => setDeleteModal(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
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
      </Box>
    </form>
  );
};

export default Settings;
