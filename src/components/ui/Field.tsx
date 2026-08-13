import { FormControl, FormHelperText, FormLabel, Typography } from "@mui/joy";
import { ReactNode } from "react";

/**
 * Label + control + helper/error, spaced the way Vercel's forms are.
 * Errors replace the helper text and tint the message red.
 */
function Field({
  label,
  helper,
  error,
  required,
  hint,
  children,
}: {
  label?: ReactNode;
  helper?: ReactNode;
  error?: string | null;
  required?: boolean;
  /** Muted text shown to the right of the label, e.g. "Optional". */
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <FormControl error={Boolean(error)} required={required}>
      {label && (
        <FormLabel
          sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{label}</span>
          {hint && (
            <Typography level="body-xs" component="span">
              {hint}
            </Typography>
          )}
        </FormLabel>
      )}
      {children}
      {(error || helper) && (
        <FormHelperText sx={error ? { color: "danger.plainColor" } : undefined}>
          {error || helper}
        </FormHelperText>
      )}
    </FormControl>
  );
}

export default Field;
