import { Box, Input, Link, Typography } from "@mui/joy";
import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import Field from "../ui/Field";
import { TelegramMark } from "./ProviderIcons";
import { connectorsAPI } from "../../service/api/smb/connectors.api.service";
import type { Location } from "../../user";

/**
 * Phone sign-in delivered over Telegram.
 *
 * There is no SMS involved: the user shares their number with our bot once,
 * which binds the number to a chat, and every login code afterwards lands in
 * that chat. The panel therefore has a third state most phone flows don't —
 * "your number isn't linked to the bot yet" — which deep-links into Telegram.
 *
 * The panel never collects profile details. An unknown number is handed to
 * `onNotRegistered` so the caller can route to registration, where the profile
 * is actually collected.
 */

const RESEND_SECONDS = 60;

export type PhoneSignInMode = "signin" | "register" | "link";

export interface PhoneVerification {
  phone: string;
  phoneToken: string;
  firstname: string;
}

function PhoneSignInPanel({
  mode = "signin",
  deviceLocation,
  initialPhone = "",
  onSuccess,
  onVerified,
  onNotRegistered,
  onAlreadyRegistered,
}: {
  mode?: PhoneSignInMode;
  deviceLocation?: Location;
  /** Prefills the number, e.g. carried over from a failed sign-in attempt. */
  initialPhone?: string;
  /** Sign-in and link modes: a session now exists. */
  onSuccess?: (result: { created?: boolean }) => void;
  /** Register mode: the number is proven, but no account exists yet. */
  onVerified?: (result: PhoneVerification) => void;
  onNotRegistered?: (phone: string) => void;
  onAlreadyRegistered?: (phone: string) => void;
}) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [botUsername, setBotUsername] = useState("");
  const [needsBotLink, setNeedsBotLink] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    connectorsAPI
      .getBotInfo()
      .then((info) => setBotUsername(info.botUsername))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [cooldown]);

  const digits = phone.replace(/\D/g, "");
  const isPhoneValid = digits.length >= 8 && digits.length <= 15;
  const botUrl = botUsername ? `https://t.me/${botUsername}` : "";

  const requestCode = useCallback(async () => {
    setBusy(true);
    setNeedsBotLink(false);
    try {
      const request =
        mode === "link"
          ? connectorsAPI.requestPhoneLink(digits)
          : connectorsAPI.requestPhoneCode(
              digits,
              mode === "register" ? "register" : "signin",
            );
      await request;
      setStep("code");
      setCooldown(RESEND_SECONDS);
    } catch (error) {
      const data = (
        error as {
          data?: {
            needsTelegramLink?: boolean;
            botUsername?: string;
            notRegistered?: boolean;
            alreadyRegistered?: boolean;
          };
        }
      )?.data;
      if (data?.needsTelegramLink) {
        setNeedsBotLink(true);
        if (data.botUsername) setBotUsername(data.botUsername);
      }
      // The API refuses to invent an account behind a code, so an unknown
      // number becomes a trip to the register page instead.
      if (data?.notRegistered) onNotRegistered?.(digits);
      if (data?.alreadyRegistered) onAlreadyRegistered?.(digits);
    } finally {
      setBusy(false);
    }
  }, [digits, mode, onAlreadyRegistered, onNotRegistered]);

  const submitCode = useCallback(async () => {
    setBusy(true);
    try {
      if (mode === "link") {
        await connectorsAPI.verifyPhoneLink(digits, code.trim());
        onSuccess?.({});
      } else if (mode === "register") {
        const response = await connectorsAPI.verifyPhoneRegistration(
          digits,
          code.trim(),
        );
        onVerified?.({
          phone: digits,
          phoneToken: response.phoneToken,
          firstname: response.firstname || "",
        });
      } else {
        const response = await connectorsAPI.verifyPhoneCode(
          digits,
          code.trim(),
          deviceLocation,
        );
        onSuccess?.({ created: response.created });
      }
    } catch (error) {
      // The interceptor already toasted the API's message; only the routing
      // hints need handling here.
      const data = (
        error as { data?: { notRegistered?: boolean; alreadyRegistered?: boolean } }
      )?.data;
      if (data?.notRegistered) onNotRegistered?.(digits);
      if (data?.alreadyRegistered) onAlreadyRegistered?.(digits);
    } finally {
      setBusy(false);
    }
  }, [
    code,
    deviceLocation,
    digits,
    mode,
    onAlreadyRegistered,
    onNotRegistered,
    onSuccess,
    onVerified,
  ]);

  if (step === "code") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
            p: 1.5,
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "md",
            backgroundColor: "background.level1",
          }}
        >
          <TelegramMark size={18} />
          <Typography level="body-sm">
            We sent a 6-digit code to your Telegram chat for{" "}
            <strong>+{digits}</strong>.
          </Typography>
        </Box>

        <Field label="Verification code">
          <Input
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && code.length === 6) void submitCode();
            }}
            placeholder="000000"
            autoComplete="one-time-code"
            inputMode="numeric"
            sx={{
              fontFamily: "code",
              letterSpacing: "0.4em",
              fontSize: "1.05rem",
            }}
          />
        </Field>

        <Button
          size="lg"
          fullWidth
          loading={busy}
          disabled={code.length !== 6}
          onClick={submitCode}
        >
          {mode === "link"
            ? "Connect phone"
            : mode === "register"
              ? "Verify number"
              : "Verify and continue"}
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Link
            component="button"
            type="button"
            level="body-sm"
            onClick={() => {
              setStep("phone");
              setCode("");
            }}
            sx={{ color: "text.tertiary" }}
          >
            Use a different number
          </Link>
          <Link
            component="button"
            type="button"
            level="body-sm"
            disabled={cooldown > 0 || busy}
            onClick={requestCode}
            sx={{ color: cooldown > 0 ? "text.tertiary" : undefined }}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Field
        label="Phone number"
        helper="Include your country code, e.g. +998 90 123 45 67"
      >
        <Input
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setNeedsBotLink(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && isPhoneValid) void requestCode();
          }}
          placeholder="+998 90 123 45 67"
          autoComplete="tel"
          inputMode="tel"
          startDecorator={<TelegramMark size={15} />}
        />
      </Field>

      {needsBotLink && (
        <Box
          sx={{
            p: 2,
            border: "1px solid",
            borderColor: "warning.outlinedBorder",
            borderRadius: "md",
            backgroundColor: "background.level1",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Typography level="title-sm">One-time setup</Typography>
          <Typography level="body-sm">
            Open our Telegram bot and tap <strong>Share my phone number</strong>.
            That links this number so we can deliver codes to your chat. Then come
            back and request a code again.
          </Typography>
          {botUrl ? (
            <Button
              variant="outlined"
              color="neutral"
              startDecorator={<TelegramMark size={15} />}
              sx={{ alignSelf: "flex-start" }}
              onClick={() => window.open(botUrl, "_blank", "noopener")}
            >
              Open @{botUsername}
            </Button>
          ) : (
            <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
              The bot username is not configured on this server yet.
            </Typography>
          )}
        </Box>
      )}

      <Button
        size="lg"
        fullWidth
        loading={busy}
        disabled={!isPhoneValid}
        onClick={requestCode}
      >
        Send code via Telegram
      </Button>

      {!needsBotLink && (
        <Typography level="body-xs" sx={{ color: "text.tertiary" }}>
          Codes arrive in Telegram, not by SMS. You will need to share your number
          with our bot once.{" "}
          {botUrl && (
            <Link href={botUrl} target="_blank" rel="noreferrer">
              Open the bot
            </Link>
          )}
        </Typography>
      )}
    </Box>
  );
}

export default PhoneSignInPanel;
