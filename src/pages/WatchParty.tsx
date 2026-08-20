import { useEffect, useState } from "react";
import { Box, Button, Input, LinearProgress, Typography } from "@mui/joy";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { People } from "../components/ui/icons";
import {
  WatchParty,
  watchPartyAPI,
} from "../service/api/smb/watchparty.api.service";
import { useUsers } from "../context/Users";
import { readGuestName, writeGuestName } from "../utilities/watchPartyIdentity";

/**
 * The door into a party.
 *
 * A party is not a separate page any more — it is the ordinary watch page with
 * everyone else in it. This route only does the two things that have to happen
 * before the film can start: work out what the party is watching, and find out
 * what to call whoever just opened the link. Then it hands over to `/watch`,
 * which already knows how to play the title, pick a provider, restore
 * subtitles, and everything else a party would otherwise have to duplicate.
 */
function WatchPartyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, myselfData } = useUsers();
  const [party, setParty] = useState<WatchParty | null>(null);
  const [pageError, setPageError] = useState("");
  const [guestName, setGuestName] = useState(readGuestName());

  const normalizedCode = String(code || "").toUpperCase();
  const isIdentityKnown = isAuthenticated || Boolean(readGuestName());

  useEffect(() => {
    if (!normalizedCode) return;
    let cancelled = false;

    watchPartyAPI
      .get(normalizedCode)
      .then((data) => {
        if (!cancelled) setParty(data);
      })
      .catch(() => {
        if (!cancelled) setPageError("This watch party has ended or never existed.");
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedCode]);

  const enterParty = () => {
    if (!party) return;

    const path =
      party.mediaType === "tv"
        ? `/tv/${party.mediaId}/${party.season || 1}/${party.episode || 1}/watch`
        : `/movie/${party.mediaId}/watch`;
    const query = new URLSearchParams({ party: normalizedCode });
    // Everyone watches the same file, so the host's source choices travel with
    // the party rather than being re-guessed per person.
    if (party.provider) query.set("provider", party.provider);
    if (party.server) query.set("server", party.server);
    if (party.version) query.set("version", party.version);

    navigate(`${path}?${query.toString()}`, { replace: true });
  };

  // Anyone we already know goes straight in — the name prompt is for first-time
  // guests only, and asking a signed-in user who they are is just a door to open.
  useEffect(() => {
    if (party && isIdentityKnown && !myselfData?.isLoading) enterParty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [party, isIdentityKnown, myselfData?.isLoading]);

  if (pageError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          px: 2,
        }}
      >
        <Typography level="h3">{pageError}</Typography>
        <Button variant="outlined" color="neutral" onClick={() => navigate("/")}>
          Back to browsing
        </Button>
      </Box>
    );
  }

  if (!party || isIdentityKnown) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Box sx={{ width: "min(420px, 100%)" }}>
          <LinearProgress thickness={2} />
          <Typography level="h4" sx={{ mt: 2 }}>
            Joining the watch party
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Helmet>
        <title>Join a watch party - Smile Movies</title>
      </Helmet>
      <Box
        sx={{
          width: "min(400px, 100%)",
          p: 3,
          borderRadius: "12px",
          border: "1px solid #1f1f1f",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <People sx={{ fontSize: 28, color: "#ededed" }} />
        <Typography level="h4">
          {party.hostName ? `${party.hostName} invited you` : "You're invited"}
        </Typography>
        <Typography level="body-sm">
          What should everyone call you? No account needed.
        </Typography>
        <Input
          autoFocus
          placeholder="Your name"
          value={guestName}
          onChange={(event) => setGuestName(event.target.value.slice(0, 30))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && guestName.trim()) {
              writeGuestName(guestName);
              enterParty();
            }
          }}
        />
        <Button
          disabled={!guestName.trim()}
          onClick={() => {
            writeGuestName(guestName);
            enterParty();
          }}
        >
          Join the party
        </Button>
        <Button
          variant="plain"
          color="neutral"
          onClick={() => navigate("/auth/login")}
        >
          Or sign in
        </Button>
      </Box>
    </Box>
  );
}

export default WatchPartyPage;
