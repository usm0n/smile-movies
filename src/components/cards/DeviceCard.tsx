import {
  DeviceUnknown,
  LaptopMac,
  PhoneIphone,
  TabletMac,
  Tv,
} from "../ui/icons";
import { Box, Chip, Typography } from "@mui/joy";
import { formatTimeAgo, smartText } from "../../utilities/defaults";
import { Device } from "../../user";

const DEVICE_ICONS: Record<string, typeof PhoneIphone> = {
  mobile: PhoneIphone,
  desktop: LaptopMac,
  tablet: TabletMac,
  tv: Tv,
};

/**
 * One row in the devices list: icon, name and where it last checked in, with
 * the whole row acting as the button that opens the device's detail sheet.
 */
function DeviceCard({
  device,
  setDeviceIdModal,
  isCurrent = false,
}: {
  device: Device;
  setDeviceIdModal: React.Dispatch<React.SetStateAction<string>>;
  isCurrent?: boolean;
}) {
  const Icon = DEVICE_ICONS[device.deviceType] || DeviceUnknown;
  const place = [device.location?.country, device.location?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <Box
      component="button"
      type="button"
      onClick={() => setDeviceIdModal(device.deviceId)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        width: "100%",
        px: 2,
        py: 1.75,
        font: "inherit",
        textAlign: "left",
        cursor: "pointer",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "md",
        backgroundColor: "background.surface",
        color: "text.primary",
        transition: "background-color 120ms, border-color 120ms",
        "&:hover": {
          backgroundColor: "background.level1",
          borderColor: "neutral.outlinedHoverBorder",
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          display: "grid",
          placeItems: "center",
          borderRadius: "md",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          backgroundColor: "background.level1",
          color: "text.secondary",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography level="title-sm" noWrap>
            {device.deviceName}
          </Typography>
          {isCurrent && (
            <Chip size="sm" variant="soft" color="primary">
              This device
            </Chip>
          )}
          {!device.isActive && (
            <Chip size="sm" variant="soft" color="warning">
              Pending
            </Chip>
          )}
        </Box>
        <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.25 }} noWrap>
          {smartText(device.deviceType)}
          {place ? ` · ${place}` : ""}
        </Typography>
      </Box>

      <Typography
        level="body-xs"
        sx={{ color: "text.tertiary", flexShrink: 0, fontFamily: "code" }}
      >
        {formatTimeAgo(device.lastLogin)}
      </Typography>
    </Box>
  );
}

export default DeviceCard;
