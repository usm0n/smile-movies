import {
  AspectRatio,
  Box,
  Button,
  Card,
  DialogActions,
  DialogTitle,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Tooltip,
  Typography,
} from "@mui/joy";
import { ResponseType, User } from "../../user";
import { deviceId, formatTimeAgo, smartText } from "../../utilities/defaults";
import { Check, Close, Help } from "@mui/icons-material";
import { useState } from "react";
import DeviceCard from "../../components/cards/DeviceCard";

function Devices({ myselfData }: { myselfData: ResponseType | null }) {
  const [deviceIdModal, setDeviceIdModal] = useState("");
  return (
    <Card
      sx={{
        width: "700px",
        margin: "0 auto",
        "@media (max-width: 800px)": {
          width: "100%",
        },
      }}
    >
      <Typography level="h4">
        Devices ({(myselfData?.data as User)?.devices.length})
      </Typography>
      <Divider />
      <Typography level="body-sm">This device</Typography>
      {(myselfData?.data as User)?.devices
        ?.filter((d) => d.deviceId == deviceId())
        .map((device) => (
          <DeviceCard device={device} setDeviceIdModal={setDeviceIdModal} />
        ))}
      <Divider />
      <Typography level="body-sm">Other devices</Typography>
      {(myselfData?.data as User)?.devices
        ?.filter((d) => d.deviceId != deviceId())
        .map((device) => (
          <DeviceCard device={device} setDeviceIdModal={setDeviceIdModal} />
        ))}
      <Modal
        open={deviceIdModal.trim() ? true : false}
        onClose={() => setDeviceIdModal("")}
      >
        <ModalDialog
          sx={{
            overflow: "scroll",
          }}
        >
          <ModalClose />
          <DialogTitle>Device Details</DialogTitle>
          {(myselfData?.data as User)?.devices
            ?.filter((d) => d.deviceId == deviceIdModal)
            .map((device) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
                key={device.deviceId}
              >
                <Box gap={1}>
                  <Typography level="h2">
                    {device.deviceName} - {smartText(device?.deviceType)}
                  </Typography>
                  <Typography level="body-sm">
                    {device.location?.country}, {device.location?.state}
                  </Typography>
                </Box>
                <Divider />
                <Card>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>First Login</Typography>
                    <Typography level="body-sm">
                      {formatTimeAgo(device.createdAt)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>Last Seen</Typography>
                    <Typography level="body-sm">
                      {formatTimeAgo(device.lastLogin)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography>Active</Typography>
                    <Typography
                      color={device.isActive ? "success" : "danger"}
                      level="body-sm"
                    >
                      {device.isActive ? "Yes" : "No"}
                    </Typography>
                  </Box>
                </Card>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <Typography level="title-lg">Location</Typography>
                  <Card>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>Last seen</Typography>
                      <Typography level="body-sm">
                        {formatTimeAgo(device.location.lastSeen!)}
                      </Typography>
                    </Box>
                    <AspectRatio>
                      <iframe
                        allowFullScreen
                        style={{
                          border: 0,
                          width: "100%",
                          height: "100%",
                        }}
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${device.location.latitude},${device.location.longitude}&z=15&output=embed`}
                      ></iframe>
                    </AspectRatio>
                    <Typography level="body-sm">
                      {device.location.county}, {device.location.town},{" "}
                      {device.location.road}
                    </Typography>
                  </Card>
                </Box>
                {!device?.isActive && (
                  <>
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          gap: 0.5,
                        }}
                      >
                        Do you want to activate this device?{" "}
                        <Tooltip title="This will activate this device and allow you to login from this device. This will also invalidate any other active sessions on this device.">
                          <Help fontSize="inherit" />
                        </Tooltip>
                      </Typography>
                      <Stack
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Button
                          color="success"
                          variant="plain"
                          startDecorator={<Check />}
                        >
                          Yes, activate this device
                        </Button>
                        <Button
                          color="danger"
                          variant="plain"
                          startDecorator={<Close />}
                        >
                          No, delete this device
                        </Button>
                      </Stack>
                    </Box>
                  </>
                )}
                <Divider />
                <DialogActions>
                  <Button color="danger" variant="solid">
                    Delete
                  </Button>
                </DialogActions>
              </Box>
            ))}
        </ModalDialog>
      </Modal>
    </Card>
  );
}
export default Devices;
