import { Link, Stack, Typography } from "@mui/joy";
import PublicPageShell from "../../components/public/PublicPageShell";

function ContactPage() {
  return (
    <PublicPageShell
      eyebrow="Contact"
      title="Questions, bug reports, and feedback all have a place."
      description="Smile Movies is still evolving quickly, so the support surface is intentionally simple and direct for now."
    >
      <Stack spacing={2.5}>
        <Typography level="body-lg" textColor="neutral.300">
          For support, bug reports, or roadmap feedback, use one of the channels below.
        </Typography>
        <Typography level="body-md">
          Telegram:{" "}
          <Link href="https://t.me/usmondev" target="_blank" rel="noreferrer">
            @usmondev
          </Link>
        </Typography>
        <Typography level="body-md">
          GitHub Issues:{" "}
          <Link href="https://github.com/usm0n/Smile-Movies/issues" target="_blank" rel="noreferrer">
            github.com/usm0n/Smile-Movies/issues
          </Link>
        </Typography>
        <Typography level="body-md" textColor="neutral.400">
          Contact and legal workflows should be revisited before broader packaged-app distribution and public community features.
        </Typography>
      </Stack>
    </PublicPageShell>
  );
}

export default ContactPage;
