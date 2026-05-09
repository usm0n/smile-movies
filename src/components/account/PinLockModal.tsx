import {
  Box, Button, Input, Modal, ModalDialog, Typography,
} from "@mui/joy";
import { LockOutlined, CheckCircleOutline } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { profilesAPI } from "../../service/api/smb/profiles.api.service";

type Mode = "setup" | "verify" | "forgot_request" | "forgot_confirm" | "change";

interface Props {
  open: boolean;
  mode: Mode;
  onSuccess: () => void;
  onCancel: () => void;
}

function PinLockModal({ open, mode: initialMode, onSuccess, onCancel }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Sync mode when prop changes (e.g. opening modal for different purpose)
  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setPin("");
      setConfirmPin("");
      setResetCode("");
      setError("");
      setDone(false);
    }
  }, [open, initialMode]);

  const resetState = () => { setPin(""); setConfirmPin(""); setResetCode(""); setError(""); };

  const handleSetup = async () => {
    if (pin.length !== 4) return setError("PIN must be 4 digits");
    if (pin !== confirmPin) return setError("PINs don't match");
    setLoading(true);
    try {
      await profilesAPI.setPin(pin);
      setDone(true);
      setTimeout(onSuccess, 1200);
    } catch { setError("Could not set PIN. Try again."); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    try {
      const result = await profilesAPI.verifyPin(pin);
      if (result.valid) { onSuccess(); }
      else { setError("Incorrect PIN"); setPin(""); }
    } catch { setError("Could not verify PIN."); }
    finally { setLoading(false); }
  };

  const handleForgotRequest = async () => {
    setLoading(true);
    try {
      await profilesAPI.resetPinRequest();
      setMode("forgot_confirm");
      resetState();
    } catch { setError("Could not send reset code."); }
    finally { setLoading(false); }
  };

  const handleForgotConfirm = async () => {
    if (resetCode.length !== 6) return setError("Enter the 6-digit code from your email");
    if (pin.length !== 4) return setError("New PIN must be 4 digits");
    if (pin !== confirmPin) return setError("PINs don't match");
    setLoading(true);
    try {
      await profilesAPI.resetPinConfirm(resetCode, pin);
      setDone(true);
      setTimeout(onSuccess, 1200);
    } catch { setError("Invalid or expired code."); }
    finally { setLoading(false); }
  };

  const PinInput = ({ label, value, setter, onEnter, autoFocus }: {
    label: string; value: string; setter: (v: string) => void; onEnter?: () => void; autoFocus?: boolean;
  }) => (
    <Input
      type="password"
      inputMode="numeric"
      placeholder={label}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => { setter(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      sx={{ width: "100%", letterSpacing: "0.4em", fontSize: "1.4rem", "& input": { textAlign: "center" } }}
    />
  );

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog sx={{ maxWidth: 340, textAlign: "center", p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,220,92,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {done
            ? <CheckCircleOutline sx={{ color: "rgb(100,220,120)", fontSize: 28 }} />
            : <LockOutlined sx={{ color: "rgb(255,220,92)", fontSize: 28 }} />}
        </Box>

        {done && (
          <Typography level="title-lg" sx={{ color: "rgb(100,220,120)" }}>
            {mode === "forgot_confirm" ? "PIN reset!" : "PIN saved!"}
          </Typography>
        )}

        {!done && mode === "verify" && (
          <>
            <Typography level="h4">Enter PIN</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>Enter your 4-digit PIN to continue.</Typography>
            <PinInput label="• • • •" value={pin} setter={setPin} onEnter={handleVerify} autoFocus />
            {error && <Typography level="body-sm" color="danger">{error}</Typography>}
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              <Button fullWidth onClick={handleVerify} disabled={pin.length !== 4} loading={loading}>Unlock</Button>
              <Button fullWidth variant="outlined" color="neutral" onClick={onCancel}>Cancel</Button>
            </Box>
            <Button variant="plain" size="sm" onClick={() => { resetState(); setMode("forgot_request"); }}>Forgot PIN?</Button>
          </>
        )}

        {!done && (mode === "setup" || mode === "change") && (
          <>
            <Typography level="h4">{mode === "change" ? "Change PIN" : "Set up PIN"}</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              {mode === "change" ? "Choose a new 4-digit PIN." : "Protect your account with a 4-digit PIN on this device."}
            </Typography>
            <PinInput label="New PIN" value={pin} setter={setPin} autoFocus />
            <PinInput label="Confirm PIN" value={confirmPin} setter={setConfirmPin} onEnter={handleSetup} />
            {error && <Typography level="body-sm" color="danger">{error}</Typography>}
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              <Button fullWidth onClick={handleSetup} disabled={pin.length !== 4 || confirmPin.length !== 4} loading={loading}>
                {mode === "change" ? "Update PIN" : "Set PIN"}
              </Button>
              <Button fullWidth variant="outlined" color="neutral" onClick={onCancel}>Cancel</Button>
            </Box>
          </>
        )}

        {!done && mode === "forgot_request" && (
          <>
            <Typography level="h4">Reset PIN</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              We'll send a 6-digit reset code to your email address.
            </Typography>
            {error && <Typography level="body-sm" color="danger">{error}</Typography>}
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              <Button fullWidth onClick={handleForgotRequest} loading={loading}>Send Reset Code</Button>
              <Button fullWidth variant="outlined" color="neutral" onClick={() => { resetState(); setMode("verify"); }}>Back</Button>
            </Box>
          </>
        )}

        {!done && mode === "forgot_confirm" && (
          <>
            <Typography level="h4">Enter Reset Code</Typography>
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              Enter the 6-digit code from your email, then choose a new PIN.
            </Typography>
            <Input
              inputMode="numeric"
              placeholder="6-digit code"
              value={resetCode}
              autoFocus
              onChange={(e) => { setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
              sx={{ width: "100%", letterSpacing: "0.3em", fontSize: "1.2rem", "& input": { textAlign: "center" } }}
            />
            <PinInput label="New PIN" value={pin} setter={setPin} />
            <PinInput label="Confirm new PIN" value={confirmPin} setter={setConfirmPin} onEnter={handleForgotConfirm} />
            {error && <Typography level="body-sm" color="danger">{error}</Typography>}
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
              <Button fullWidth onClick={handleForgotConfirm} disabled={resetCode.length !== 6 || pin.length !== 4} loading={loading}>Reset PIN</Button>
              <Button fullWidth variant="outlined" color="neutral" onClick={() => { resetState(); setMode("forgot_request"); }}>Back</Button>
            </Box>
          </>
        )}
      </ModalDialog>
    </Modal>
  );
}

export default PinLockModal;
