import { Box, Button, Input, Modal, ModalDialog, Typography } from "@mui/joy";
import { LockOutlined } from "../ui/icons";
import { useState } from "react";
import { smbV1API } from "../../service/api/api";

interface Props {
  profileId: string;
  profileName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function PinPrompt({ profileId, profileName, onSuccess, onCancel }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const r = await smbV1API.post("/profiles/pin/verify", { profileId, pin });
      if (r.data.valid) {
        onSuccess();
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onCancel}>
      <ModalDialog
        sx={{
          maxWidth: 340,
          textAlign: "center",
          p: 4,
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <LockOutlined sx={{ color: "#ededed", fontSize: 28 }} />
        </Box>
        <Typography level="h4">Enter PIN</Typography>
        <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
          <strong>{profileName}</strong> is protected. Enter the 4-digit PIN to
          continue.
        </Typography>
        <Input
          type="password"
          inputMode="numeric"
          placeholder="• • • •"
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPin(v);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && pin.length === 4 && verify()}
          autoFocus
          sx={{
            width: "100%",
            textAlign: "center",
            letterSpacing: "0.4em",
            fontSize: "1.5rem",
            "& input": { textAlign: "center" },
          }}
        />
        {error && (
          <Typography level="body-sm" color="danger">
            {error}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, width: "100%", mt: 1 }}>
          <Button
            fullWidth
            onClick={verify}
            disabled={pin.length !== 4 || loading}
            loading={loading}
          >
            Unlock
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="neutral"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

export default PinPrompt;
