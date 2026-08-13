import { Button as JoyButton, ButtonProps, CircularProgress } from "@mui/joy";
import { forwardRef } from "react";

export type SmileButtonProps = ButtonProps & {
  /** While true the button is disabled and shows a spinner in place of its icon. */
  loading?: boolean;
};

/**
 * Vercel-style button.
 *
 * Every mutating action in the app should use `loading` rather than swapping
 * the label out for "Loading..." — the label stays put, the leading icon is
 * replaced by a spinner, and the button is disabled for the duration.
 */
const Button = forwardRef<HTMLButtonElement, SmileButtonProps>(function Button(
  { loading = false, disabled, startDecorator, children, ...props },
  ref,
) {
  return (
    <JoyButton
      ref={ref}
      disabled={disabled || loading}
      startDecorator={
        loading ? (
          <CircularProgress
            variant="plain"
            thickness={2}
            sx={{
              "--CircularProgress-size": "14px",
              color: "inherit",
            }}
          />
        ) : (
          startDecorator
        )
      }
      {...props}
    >
      {children}
    </JoyButton>
  );
});

export default Button;
