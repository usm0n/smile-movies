/**
 * The parts of IMDb's title page that arrive with the details request and need
 * no further fetching: box office, technical specifications, per-country
 * certificates and keywords.
 *
 * Each block hides itself when IMDb has nothing for it, which is common — TV
 * has no box office, older films have no camera data — so the layout is a flow
 * of independent blocks rather than a fixed grid with holes in it.
 */

import { Box, Chip, Divider, Typography } from "@mui/joy";
import { useState } from "react";
import {
  ImdbBoxOffice,
  ImdbCertificate,
  ImdbTechnicalSpecs,
  ImdbTitleDetails,
} from "../../../service/api/imdb/imdb.api.service";
import { Aperture, Coins, Scale, Tag } from "../../ui/icons";
import { ImdbCredit, ImdbSection } from "./ImdbSectionUI";
import {
  SPEC_LABELS,
  cardSx,
  formatMoney,
  formatMoneyFull,
  hasBoxOffice,
  hasTechnicalSpecs,
} from "./imdbShared";

/** Label/value pair used across all four blocks. */
function Fact({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <Box sx={{ minWidth: 140 }}>
      <Typography level="body-xs" textColor="neutral.500">
        {label}
      </Typography>
      <Typography level="body-sm" textColor="neutral.200" title={title}>
        {value}
      </Typography>
    </Box>
  );
}

function BoxOfficeBlock({ boxOffice }: { boxOffice: ImdbBoxOffice }) {
  const entries: Array<[string, string, string]> = [];

  const push = (label: string, money?: ImdbBoxOffice[keyof ImdbBoxOffice]) => {
    const formatted = formatMoney(money as never);
    if (formatted) entries.push([label, formatted, formatMoneyFull(money as never)]);
  };

  push("Budget", boxOffice.budget);
  push("Opening weekend (US)", boxOffice.openingWeekendDomestic);
  push("Gross (US & Canada)", boxOffice.grossDomestic);
  push("Gross worldwide", boxOffice.grossWorldwide);

  if (!entries.length) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography level="title-sm" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Coins sx={{ fontSize: 16 }} /> Box office
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {entries.map(([label, value, full]) => (
          <Fact key={label} label={label} value={value} title={full} />
        ))}
      </Box>
    </Box>
  );
}

function TechnicalBlock({ specs }: { specs: ImdbTechnicalSpecs }) {
  const entries: Array<[string, string]> = [];

  if (specs.runtimeText) entries.push(["Runtime", specs.runtimeText]);

  for (const [key, label] of SPEC_LABELS) {
    const values = specs[key];
    if (Array.isArray(values) && values.length) {
      entries.push([label, values.join(", ")]);
    }
  }

  if (!entries.length) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography level="title-sm" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Aperture sx={{ fontSize: 16 }} /> Technical specs
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {entries.map(([label, value]) => (
          <Fact key={label} label={label} value={value} />
        ))}
      </Box>
    </Box>
  );
}

const CERTIFICATES_PREVIEW = 12;

function CertificatesBlock({
  certificate,
  certificates,
}: {
  certificate?: ImdbCertificate;
  certificates: ImdbCertificate[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (!certificate && !certificates.length) return null;

  const visible = expanded ? certificates : certificates.slice(0, CERTIFICATES_PREVIEW);
  const remaining = certificates.length - visible.length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography level="title-sm" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Scale sx={{ fontSize: 16 }} /> Certification
      </Typography>

      {certificate && (
        <Box sx={cardSx}>
          <Typography level="body-sm" textColor="neutral.200">
            {certificate.ratingsBody
              ? `${certificate.ratingsBody} ${certificate.rating}`
              : certificate.rating}
          </Typography>
          {certificate.ratingReason && (
            <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.25 }}>
              {certificate.ratingReason}
            </Typography>
          )}
        </Box>
      )}

      {certificates.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {visible.map((entry, index) => (
            <Chip
              key={`${entry.country?.id ?? "x"}-${entry.rating}-${index}`}
              size="sm"
              variant="soft"
              color="neutral"
              title={entry.ratingReason}
            >
              {entry.country?.id ? `${entry.country.id} ${entry.rating}` : entry.rating}
            </Chip>
          ))}
          {remaining > 0 && (
            <Chip
              size="sm"
              variant="outlined"
              color="neutral"
              onClick={() => setExpanded(true)}
              sx={{ cursor: "pointer" }}
            >
              +{remaining} more
            </Chip>
          )}
        </Box>
      )}
    </Box>
  );
}

function KeywordsBlock({ keywords, total }: { keywords: string[]; total: number }) {
  if (!keywords.length) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Typography level="title-sm" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Tag sx={{ fontSize: 16 }} /> Keywords
        {total > keywords.length && (
          <Typography level="body-xs" textColor="neutral.500">
            (top {keywords.length} of {total.toLocaleString()})
          </Typography>
        )}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {keywords.map((keyword) => (
          <Chip key={keyword} size="sm" variant="soft" color="neutral">
            {keyword}
          </Chip>
        ))}
      </Box>
    </Box>
  );
}

function ImdbTitleFacts({ details }: { details: ImdbTitleDetails }) {
  // Which blocks have data is decided here, not inside the blocks — rendering
  // a component just to see whether it returns null would run its hooks.
  const blocks = [
    hasBoxOffice(details.boxOffice) && (
      <BoxOfficeBlock key="box" boxOffice={details.boxOffice} />
    ),
    hasTechnicalSpecs(details.technicalSpecs) && (
      <TechnicalBlock key="tech" specs={details.technicalSpecs} />
    ),
    (details.certificate || details.certificates.length > 0) && (
      <CertificatesBlock
        key="cert"
        certificate={details.certificate}
        certificates={details.certificates}
      />
    ),
    details.keywords.length > 0 && (
      <KeywordsBlock
        key="kw"
        keywords={details.keywords}
        total={details.counts.keywords}
      />
    ),
  ].filter(Boolean) as JSX.Element[];

  if (!blocks.length) return null;

  return (
    <ImdbSection title="Details" icon={<Scale sx={{ fontSize: 22 }} />}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {blocks.map((block, index) => (
          <Box key={block.key} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {block}
            {index < blocks.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>
      <ImdbCredit />
    </ImdbSection>
  );
}

export default ImdbTitleFacts;
