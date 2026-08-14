import { Box, Chip, Input, Typography } from "@mui/joy";
import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import Field from "../../components/ui/Field";
import Panel from "../../components/ui/Panel";
import { Shimmer } from "../../components/ui/Skeleton";
import { toast } from "../../components/ui/toast";
import {
  Add,
  Check,
  Delete,
  Lock,
  Mail,
  PhoneIphone,
  VerifiedRounded,
} from "../../components/ui/icons";
import {
  AppleMark,
  GoogleMark,
  TelegramMark,
} from "../../components/auth/ProviderIcons";
import PhoneSignInPanel from "../../components/auth/PhoneSignInPanel";
import { useFederatedSignIn } from "../../components/auth/useFederatedSignIn";
import { connectorsAPI } from "../../service/api/smb/connectors.api.service";
import {
  ConnectorsResponse,
  IdentityProvider,
  providerLabel,
} from "../../types/connectors";
import { isValidEmail } from "../../utilities/defaults";

/**
 * Settings → Login connections.
 *
 * One account, many ways in: email+password, Google, Apple, phone-via-Telegram,
 * plus any number of secondary email addresses. The API refuses to remove the
 * last remaining method, and this page mirrors that by disabling the control
 * rather than letting the user discover it through an error.
 */

const PROVIDER_ROWS: {
  provider: Exclude<IdentityProvider, "password">;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    provider: "google.com",
    icon: <GoogleMark size={18} />,
    description: "Sign in with your Google account.",
  },
  {
    provider: "apple.com",
    icon: <AppleMark size={18} />,
    description: "Sign in with Apple, including Hide My Email.",
  },
  {
    provider: "phone",
    icon: <PhoneIphone sx={{ fontSize: 18 }} />,
    description: "Get one-time codes in Telegram instead of by SMS.",
  },
];

function Connections() {
  const [data, setData] = useState<ConnectorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<IdentityProvider | null>(null);
  const [confirmUnlink, setConfirmUnlink] = useState<IdentityProvider | null>(null);
  const [phoneDialog, setPhoneDialog] = useState(false);

  const [emailDialog, setEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setData(await connectorsAPI.list());
    } catch {
      // Interceptor already reported it.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const federated = useFederatedSignIn({
    mode: "link",
    onSuccess: () => {
      void refresh();
    },
  });

  const identities = data?.identities || [];
  const emails = data?.emails || [];
  const linkedProviders = new Set(identities.map((item) => item.provider));
  const canUnlink = identities.length > 1;

  const handleUnlink = async (provider: IdentityProvider) => {
    setUnlinking(provider);
    try {
      await connectorsAPI.unlink(provider);
      await refresh();
      setConfirmUnlink(null);
    } catch {
      // Interceptor already reported it.
    } finally {
      setUnlinking(null);
    }
  };

  const handleAddEmail = async () => {
    setEmailBusy(true);
    try {
      await connectorsAPI.addEmail(newEmail.trim().toLowerCase());
      setVerifyTarget(newEmail.trim().toLowerCase());
      setNewEmail("");
      setEmailDialog(false);
      await refresh();
    } catch {
      // Interceptor already reported it.
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verifyTarget) return;
    setEmailBusy(true);
    try {
      await connectorsAPI.verifyEmail(verifyTarget, verifyCode.trim());
      setVerifyTarget(null);
      setVerifyCode("");
      await refresh();
    } catch {
      // Interceptor already reported it.
    } finally {
      setEmailBusy(false);
    }
  };

  const handleSetPassword = async () => {
    setPasswordBusy(true);
    try {
      await connectorsAPI.setPassword(newPassword);
      setPasswordDialog(false);
      setNewPassword("");
      await refresh();
      toast.success("You can now sign in with your email and password.");
    } catch {
      // Interceptor already reported it.
    } finally {
      setPasswordBusy(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Shimmer height={220} radius={12} />
        <Shimmer height={180} radius={12} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Panel
        title="Login connections"
        description="Connect more than one way to sign in. Any connected method reaches this same account."
        footerHint={
          canUnlink
            ? `${identities.length} sign-in methods connected.`
            : "Connect a second method before you can remove this one."
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {/* Email + password is special: it is added by setting a password
              rather than by an OAuth popup. */}
          <ConnectorRow
            icon={<Lock sx={{ fontSize: 18 }} />}
            title="Email & password"
            description={
              data?.hasPassword
                ? `Password sign-in is on for ${emails.find((item) => item.isPrimary)?.email || "your primary email"}.`
                : "Set a password so you can sign in without a provider."
            }
            connected={Boolean(data?.hasPassword)}
            action={
              data?.hasPassword ? (
                <Button
                  size="sm"
                  variant="outlined"
                  color="danger"
                  disabled={!canUnlink}
                  loading={unlinking === "password"}
                  onClick={() => setConfirmUnlink("password")}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  onClick={() => setPasswordDialog(true)}
                >
                  Set password
                </Button>
              )
            }
          />

          {PROVIDER_ROWS.map((row) => {
            const identity = identities.find(
              (item) => item.provider === row.provider,
            );
            const connected = linkedProviders.has(row.provider);

            return (
              <ConnectorRow
                key={row.provider}
                icon={row.icon}
                title={providerLabel(row.provider)}
                description={
                  connected
                    ? identity?.email || identity?.phone || row.description
                    : row.description
                }
                connected={connected}
                action={
                  connected ? (
                    <Button
                      size="sm"
                      variant="outlined"
                      color="danger"
                      disabled={!canUnlink}
                      loading={unlinking === row.provider}
                      onClick={() => setConfirmUnlink(row.provider)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outlined"
                      color="neutral"
                      loading={federated.pending === row.provider}
                      onClick={() => {
                        if (row.provider === "phone") setPhoneDialog(true);
                        else federated.start(row.provider);
                      }}
                    >
                      Connect
                    </Button>
                  )
                }
              />
            );
          })}
        </Box>
      </Panel>

      {data?.telegram && (
        <Panel
          title="Telegram"
          description="Where your phone sign-in codes are delivered."
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <TelegramMark size={18} />
            <Typography level="body-sm">
              Linked to{" "}
              <strong>
                {data.telegram.username
                  ? `@${data.telegram.username}`
                  : data.telegram.firstName || "your Telegram account"}
              </strong>{" "}
              since {data.telegram.linkedAt}.
            </Typography>
          </Box>
        </Panel>
      )}

      <Panel
        title="Email addresses"
        description="Any confirmed address can be used to sign in. The primary one receives notifications."
        footerHint={`${emails.length} of 5 addresses used.`}
        footer={
          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<Add sx={{ fontSize: 16 }} />}
            disabled={emails.length >= 5}
            onClick={() => setEmailDialog(true)}
          >
            Add email
          </Button>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {emails.length === 0 && (
            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
              This account has no email address — it signs in by phone.
            </Typography>
          )}
          {emails.map((entry, index) => (
            <Box
              key={entry.email}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                py: 1.75,
                borderTop: index === 0 ? "none" : "1px solid",
                borderColor: "neutral.outlinedBorder",
              }}
            >
              <Mail sx={{ fontSize: 16, color: "text.tertiary" }} />
              <Typography level="body-sm" sx={{ flex: 1, minWidth: 180 }}>
                {entry.email}
              </Typography>
              {entry.isPrimary && (
                <Chip size="sm" variant="soft" color="primary">
                  Primary
                </Chip>
              )}
              {entry.isVerified ? (
                <Chip
                  size="sm"
                  variant="soft"
                  color="success"
                  startDecorator={<VerifiedRounded sx={{ fontSize: 13 }} />}
                >
                  Verified
                </Chip>
              ) : (
                <Button
                  size="sm"
                  variant="plain"
                  color="warning"
                  onClick={() => setVerifyTarget(entry.email)}
                >
                  Confirm
                </Button>
              )}
              {!entry.isPrimary && entry.isVerified && (
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  startDecorator={<Check sx={{ fontSize: 15 }} />}
                  onClick={async () => {
                    await connectorsAPI.setPrimaryEmail(entry.email);
                    await refresh();
                  }}
                >
                  Make primary
                </Button>
              )}
              {!entry.isPrimary && (
                <Button
                  size="sm"
                  variant="plain"
                  color="danger"
                  startDecorator={<Delete sx={{ fontSize: 15 }} />}
                  onClick={async () => {
                    await connectorsAPI.removeEmail(entry.email);
                    await refresh();
                  }}
                >
                  Remove
                </Button>
              )}
            </Box>
          ))}
        </Box>
      </Panel>

      {/* ── Connect phone ── */}
      <Dialog
        open={phoneDialog}
        onClose={() => setPhoneDialog(false)}
        title="Connect a phone number"
        description="We deliver your sign-in codes through our Telegram bot."
        width={430}
      >
        <PhoneSignInPanel
          mode="link"
          onSuccess={() => {
            setPhoneDialog(false);
            void refresh();
          }}
        />
      </Dialog>

      {/* ── Add email ── */}
      <Dialog
        open={emailDialog}
        onClose={() => setEmailDialog(false)}
        title="Add an email address"
        description="We'll send a 6-character code to confirm you own it."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setEmailDialog(false)}
            >
              Cancel
            </Button>
            <Button
              loading={emailBusy}
              disabled={!isValidEmail(newEmail)}
              onClick={handleAddEmail}
            >
              Send code
            </Button>
          </>
        }
      >
        <Field label="Email address">
          <Input
            value={newEmail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(event) => setNewEmail(event.target.value.toLowerCase())}
            startDecorator={<Mail sx={{ fontSize: 16 }} />}
          />
        </Field>
      </Dialog>

      {/* ── Confirm email ── */}
      <Dialog
        open={Boolean(verifyTarget)}
        onClose={() => {
          setVerifyTarget(null);
          setVerifyCode("");
        }}
        title="Confirm email address"
        description={`Enter the code we sent to ${verifyTarget}.`}
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={async () => {
                if (verifyTarget) await connectorsAPI.addEmail(verifyTarget);
              }}
            >
              Resend code
            </Button>
            <Button
              loading={emailBusy}
              disabled={verifyCode.trim().length < 6}
              onClick={handleVerifyEmail}
            >
              Confirm
            </Button>
          </>
        }
      >
        <Field label="Confirmation code">
          <Input
            value={verifyCode}
            placeholder="A1B2C3"
            onChange={(event) => setVerifyCode(event.target.value.toUpperCase())}
            sx={{ fontFamily: "code", letterSpacing: "0.25em" }}
          />
        </Field>
      </Dialog>

      {/* ── Set password ── */}
      <Dialog
        open={passwordDialog}
        onClose={() => setPasswordDialog(false)}
        title="Set a password"
        description="Adds email and password as another way into this account."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              loading={passwordBusy}
              disabled={newPassword.trim().length < 8}
              onClick={handleSetPassword}
            >
              Set password
            </Button>
          </>
        }
      >
        <Field
          label="New password"
          required
          error={
            newPassword.trim() && newPassword.length < 8
              ? "Use at least 8 characters"
              : null
          }
        >
          <Input
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
            startDecorator={<Lock sx={{ fontSize: 16 }} />}
          />
        </Field>
      </Dialog>

      {/* ── Disconnect confirmation ── */}
      <Dialog
        open={Boolean(confirmUnlink)}
        onClose={() => setConfirmUnlink(null)}
        title={`Disconnect ${confirmUnlink ? providerLabel(confirmUnlink) : ""}?`}
        description="You will no longer be able to sign in with this method. Your account and library stay exactly as they are."
        actions={
          <>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => setConfirmUnlink(null)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              loading={Boolean(unlinking)}
              onClick={() => confirmUnlink && handleUnlink(confirmUnlink)}
            >
              Disconnect
            </Button>
          </>
        }
      />
    </Box>
  );
}

/** One row in the connections list: icon, copy, status and a single action. */
function ConnectorRow({
  icon,
  title,
  description,
  connected,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  connected: boolean;
  action: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 2,
        flexWrap: "wrap",
        "&:not(:first-of-type)": {
          borderTop: "1px solid",
          borderColor: "neutral.outlinedBorder",
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
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 180 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="title-sm">{title}</Typography>
          {connected && (
            <Chip size="sm" variant="soft" color="success">
              Connected
            </Chip>
          )}
        </Box>
        <Typography level="body-xs" sx={{ color: "text.tertiary", mt: 0.25 }}>
          {description}
        </Typography>
      </Box>

      {action}
    </Box>
  );
}

export default Connections;
