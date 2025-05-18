import {
  DeviceUnknown,
  LaptopMac,
  PhoneIphone,
  TabletMac,
  Tv,
} from "@mui/icons-material";
import { Box, Card, Typography } from "@mui/joy";
import { formatTimeAgo, smartText } from "../../utilities/defaults";
import { Device } from "../../user";

function DeviceCard({
  device,
  setDeviceIdModal,
}: {
  device: Device;
  setDeviceIdModal: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Card
      key={device.deviceId}
      onClick={() => setDeviceIdModal(device.deviceId)}
      sx={{
        transition: "all 0.1s ease",
        cursor: "pointer",
        ":hover": {
          opacity: 0.8,
        },
      }}
    >
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
          <Typography level="title-lg">{device.deviceName}</Typography>
          <Typography level="body-sm">
            {smartText(device.deviceType)}
          </Typography>
          <Typography level="body-xs">
            {device.location?.country}, {device.location?.state}
          </Typography>
        </Box>
        <Typography
          level="body-xs"
          sx={{
            position: "absolute",
            top: "10px",
            right: "20px",
          }}
        >
          {formatTimeAgo(device.lastLogin)}
        </Typography>
      </Box>
    </Card>
  );
}

export default DeviceCard;
