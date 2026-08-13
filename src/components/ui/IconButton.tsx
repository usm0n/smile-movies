import {
  CircularProgress,
  IconButton as JoyIconButton,
  IconButtonProps,
  Tooltip,
} from "@mui/joy";
import { forwardRef } from "react";

export type SmileIconButtonProps = IconButtonProps & {
  /** Accessible name — icon-only controls must always have one. */
  label: string;
  /** Show the label in a tooltip on hover as well. */
  tooltip?: boolean;
  loading?: boolean;
};

const IconButton = forwardRef<HTMLButtonElement, SmileIconButtonProps>(
  function IconButton(
    { label, tooltip = false, loading = false, disabled, children, ...props },
    ref,
  ) {
    const button = (
      <JoyIconButton
        ref={ref}
        aria-label={label}
        disabled={disabled || loading}
        variant={props.variant ?? "plain"}
        color={props.color ?? "neutral"}
        {...props}
      >
        {loading ? (
          <CircularProgress
            variant="plain"
            thickness={2}
            sx={{ "--CircularProgress-size": "16px", color: "inherit" }}
          />
        ) : (
          children
        )}
      </JoyIconButton>
    );

    if (!tooltip) return button;
    return (
      <Tooltip title={label} variant="outlined" size="sm">
        {button}
      </Tooltip>
    );
  },
);

export default IconButton;
