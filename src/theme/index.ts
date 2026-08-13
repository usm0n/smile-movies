import { extendTheme } from "@mui/joy/styles";

/**
 * Smile Movies design system.
 *
 * A Vercel-style monochrome dark theme: pure black page, #0a0a0a surfaces,
 * hairline #1f1f1f borders, Geist typography, white primary buttons and one
 * small radius scale. Every colour in the app should come from these tokens
 * rather than being written inline at the call site.
 */

export const tokens = {
  black: "#000000",
  surface: "#0a0a0a",
  level1: "#111111",
  level2: "#1a1a1a",
  border: "#1f1f1f",
  borderHover: "#333333",
  textPrimary: "#ededed",
  textSecondary: "#a1a1a1",
  textTertiary: "#707070",
  blue: "#0070f3",
  blueHover: "#3291ff",
  blueDim: "rgba(0, 112, 243, 0.12)",
  amber: "#f5a623",
  amberDim: "rgba(245, 166, 35, 0.12)",
  red: "#e5484d",
  redHover: "#ff6369",
  redDim: "rgba(229, 72, 77, 0.12)",
  green: "#3ecf8e",
  greenDim: "rgba(62, 207, 142, 0.12)",
  focusRing: "0 0 0 2px #000000, 0 0 0 4px #0070f3",
} as const;

export const fontStack = [
  '"Geist Variable"',
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  "sans-serif",
].join(", ");

export const monoStack = [
  '"Geist Mono Variable"',
  "ui-monospace",
  "SFMono-Regular",
  "Menlo",
  "monospace",
].join(", ");

const focusVisible = {
  outline: "none",
  boxShadow: tokens.focusRing,
};

const theme = extendTheme({
  cssVarPrefix: "smile",
  fontFamily: {
    body: fontStack,
    display: fontStack,
    code: monoStack,
    fallback: fontStack,
  },
  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
  },
  shadow: {
    xs: "0 1px 2px rgba(0,0,0,0.6)",
    sm: "0 2px 4px rgba(0,0,0,0.6)",
    md: "0 4px 12px rgba(0,0,0,0.7)",
    lg: "0 8px 24px rgba(0,0,0,0.75)",
    xl: "0 16px 48px rgba(0,0,0,0.8)",
  },
  focus: {
    default: focusVisible,
  },
  colorSchemes: {
    dark: {
      palette: {
        background: {
          body: tokens.black,
          surface: tokens.surface,
          level1: tokens.level1,
          level2: tokens.level2,
          popup: tokens.surface,
          backdrop: "rgba(0, 0, 0, 0.72)",
          tooltip: tokens.level2,
        },
        text: {
          primary: tokens.textPrimary,
          secondary: tokens.textSecondary,
          tertiary: tokens.textTertiary,
          icon: tokens.textSecondary,
        },
        divider: tokens.border,
        focusVisible: tokens.blue,
        common: { white: "#ffffff", black: "#000000" },
        primary: {
          50: "#ffffff",
          100: "#fafafa",
          200: "#ededed",
          300: "#a1a1a1",
          400: "#707070",
          500: "#ffffff",
          600: "#ededed",
          700: "#a1a1a1",
          800: "#333333",
          900: "#1f1f1f",
          solidBg: "#ffffff",
          solidHoverBg: "#e5e5e5",
          solidActiveBg: "#cccccc",
          solidColor: "#000000",
          solidDisabledBg: "#1f1f1f",
          solidDisabledColor: "#707070",
          outlinedBorder: tokens.border,
          outlinedColor: tokens.textPrimary,
          outlinedHoverBg: tokens.level1,
          outlinedActiveBg: tokens.level2,
          plainColor: tokens.textPrimary,
          plainHoverBg: tokens.level1,
          plainActiveBg: tokens.level2,
          softBg: tokens.level1,
          softColor: tokens.textPrimary,
          softHoverBg: tokens.level2,
          softActiveBg: "#222222",
        },
        neutral: {
          50: "#fafafa",
          100: tokens.textPrimary,
          200: "#cccccc",
          300: tokens.textSecondary,
          400: tokens.textTertiary,
          500: "#4d4d4d",
          600: tokens.borderHover,
          700: "#282828",
          800: tokens.border,
          900: tokens.surface,
          solidBg: tokens.level2,
          solidHoverBg: "#222222",
          solidActiveBg: "#282828",
          solidColor: tokens.textPrimary,
          outlinedBg: tokens.surface,
          outlinedBorder: tokens.border,
          outlinedColor: tokens.textPrimary,
          outlinedHoverBg: tokens.level1,
          outlinedHoverBorder: tokens.borderHover,
          outlinedActiveBg: tokens.level2,
          outlinedDisabledColor: tokens.textTertiary,
          outlinedDisabledBorder: tokens.border,
          plainColor: tokens.textSecondary,
          plainHoverBg: tokens.level1,
          plainHoverColor: tokens.textPrimary,
          plainActiveBg: tokens.level2,
          plainDisabledColor: tokens.textTertiary,
          softBg: tokens.level1,
          softColor: tokens.textPrimary,
          softHoverBg: tokens.level2,
          softActiveBg: "#222222",
          softDisabledColor: tokens.textTertiary,
        },
        danger: {
          solidBg: tokens.red,
          solidHoverBg: tokens.redHover,
          solidActiveBg: "#d13438",
          solidColor: "#ffffff",
          outlinedBorder: "rgba(229, 72, 77, 0.35)",
          outlinedColor: tokens.redHover,
          outlinedHoverBg: tokens.redDim,
          plainColor: tokens.redHover,
          plainHoverBg: tokens.redDim,
          softBg: tokens.redDim,
          softColor: tokens.redHover,
          softHoverBg: "rgba(229, 72, 77, 0.2)",
        },
        success: {
          solidBg: tokens.green,
          solidColor: "#000000",
          outlinedBorder: "rgba(62, 207, 142, 0.35)",
          outlinedColor: tokens.green,
          plainColor: tokens.green,
          softBg: tokens.greenDim,
          softColor: tokens.green,
        },
        warning: {
          solidBg: tokens.amber,
          solidColor: "#000000",
          outlinedBorder: "rgba(245, 166, 35, 0.35)",
          outlinedColor: tokens.amber,
          plainColor: tokens.amber,
          softBg: tokens.amberDim,
          softColor: tokens.amber,
        },
      },
    },
  },
  typography: {
    h1: {
      fontSize: "clamp(2.25rem, 5vw, 3rem)",
      fontWeight: 600,
      letterSpacing: "-0.04em",
      lineHeight: 1.1,
      color: tokens.textPrimary,
    },
    h2: {
      fontSize: "clamp(1.75rem, 3.5vw, 2.25rem)",
      fontWeight: 600,
      letterSpacing: "-0.035em",
      lineHeight: 1.15,
      color: tokens.textPrimary,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
      color: tokens.textPrimary,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "-0.02em",
      lineHeight: 1.3,
      color: tokens.textPrimary,
    },
    "title-lg": {
      fontSize: "1.0625rem",
      fontWeight: 600,
      letterSpacing: "-0.015em",
      color: tokens.textPrimary,
    },
    "title-md": {
      fontSize: "0.9375rem",
      fontWeight: 500,
      letterSpacing: "-0.01em",
      color: tokens.textPrimary,
    },
    "title-sm": {
      fontSize: "0.875rem",
      fontWeight: 500,
      letterSpacing: "-0.005em",
      color: tokens.textPrimary,
    },
    "body-lg": {
      fontSize: "1.0625rem",
      lineHeight: 1.6,
      color: tokens.textSecondary,
    },
    "body-md": {
      fontSize: "0.9375rem",
      lineHeight: 1.6,
      color: tokens.textSecondary,
    },
    "body-sm": {
      fontSize: "0.875rem",
      lineHeight: 1.55,
      color: tokens.textSecondary,
    },
    "body-xs": {
      fontSize: "0.75rem",
      lineHeight: 1.5,
      color: tokens.textTertiary,
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState, theme: t }) => ({
          fontFamily: fontStack,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          borderRadius: t.vars.radius.sm,
          transition:
            "background-color 150ms ease, border-color 150ms ease, color 150ms ease, opacity 150ms ease",
          "--Button-gap": "8px",
          ...(ownerState.size === "sm" && {
            minHeight: 32,
            fontSize: "0.8125rem",
            paddingInline: 12,
          }),
          ...(ownerState.size === "md" && {
            minHeight: 36,
            fontSize: "0.875rem",
            paddingInline: 14,
          }),
          ...(ownerState.size === "lg" && {
            minHeight: 44,
            fontSize: "0.9375rem",
            paddingInline: 18,
          }),
          "&:focus-visible": focusVisible,
          "&.Mui-disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
          },
          // Keep the label in place while the loading spinner is shown
          "& .MuiCircularProgress-root": {
            "--CircularProgress-size": "16px",
            "--CircularProgress-trackThickness": "2px",
            "--CircularProgress-progressThickness": "2px",
          },
        }),
      },
    },
    JoyIconButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: t.vars.radius.sm,
          transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
          "&:focus-visible": focusVisible,
          "&.Mui-disabled": { opacity: 0.5 },
        }),
      },
    },
    JoyInput: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "--Input-focusedThickness": "0px",
          "--Input-placeholderOpacity": 1,
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
          borderRadius: t.vars.radius.sm,
          boxShadow: "none",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
          "& input::placeholder": { color: tokens.textTertiary, opacity: 1 },
          "&:hover:not(.Mui-focused)": { borderColor: tokens.borderHover },
          "&.Mui-focused": {
            borderColor: tokens.blue,
            boxShadow: `0 0 0 3px ${tokens.blueDim}`,
          },
          "&.Mui-error.Mui-focused": {
            borderColor: tokens.red,
            boxShadow: `0 0 0 3px ${tokens.redDim}`,
          },
        }),
      },
    },
    JoyTextarea: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "--Textarea-focusedThickness": "0px",
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
          borderRadius: t.vars.radius.sm,
          boxShadow: "none",
          "& textarea::placeholder": { color: tokens.textTertiary, opacity: 1 },
          "&:hover:not(.Mui-focused)": { borderColor: tokens.borderHover },
          "&.Mui-focused": {
            borderColor: tokens.blue,
            boxShadow: `0 0 0 3px ${tokens.blueDim}`,
          },
        }),
      },
    },
    JoySelect: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
          borderRadius: t.vars.radius.sm,
          boxShadow: "none",
          "&:hover": { borderColor: tokens.borderHover, backgroundColor: tokens.surface },
          "&.Mui-focused": {
            borderColor: tokens.blue,
            boxShadow: `0 0 0 3px ${tokens.blueDim}`,
          },
        }),
        listbox: ({ theme: t }) => ({
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: t.vars.radius.md,
          boxShadow: t.vars.shadow.md,
          padding: 4,
        }),
      },
    },
    JoyAutocomplete: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          "--Input-focusedThickness": "0px",
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
          borderRadius: t.vars.radius.sm,
          boxShadow: "none",
          "&:hover:not(.Mui-focused)": { borderColor: tokens.borderHover },
          "&.Mui-focused": {
            borderColor: tokens.blue,
            boxShadow: `0 0 0 3px ${tokens.blueDim}`,
          },
        }),
      },
    },
    JoyAutocompleteListbox: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: t.vars.radius.md,
          boxShadow: t.vars.shadow.md,
          padding: 4,
        }),
      },
    },
    JoyAutocompleteOption: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: t.vars.radius.xs,
          "&[aria-selected='true'], &.Mui-focused": {
            backgroundColor: tokens.level1,
          },
        }),
      },
    },
    JoyCard: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
          borderRadius: t.vars.radius.lg,
          boxShadow: "none",
          backdropFilter: "none",
        }),
      },
    },
    JoySheet: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backdropFilter: "none",
        },
      },
    },
    JoyMenu: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: t.vars.radius.md,
          boxShadow: t.vars.shadow.md,
          padding: 4,
          minWidth: 200,
          backdropFilter: "none",
        }),
      },
    },
    JoyMenuItem: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: t.vars.radius.xs,
          fontSize: "0.875rem",
          color: tokens.textSecondary,
          gap: 8,
          "&:hover": { backgroundColor: tokens.level1, color: tokens.textPrimary },
          "&:focus-visible": focusVisible,
        }),
      },
    },
    JoyListItemButton: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: t.vars.radius.sm,
          fontSize: "0.875rem",
          "&:focus-visible": focusVisible,
        }),
      },
    },
    JoyModalDialog: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: t.vars.radius.lg,
          boxShadow: t.vars.shadow.xl,
          backgroundImage: "none",
          backdropFilter: "none",
        }),
      },
    },
    JoyModalOverflow: {
      styleOverrides: {
        root: { backdropFilter: "none" },
      },
    },
    JoyDrawer: {
      styleOverrides: {
        content: {
          backgroundColor: tokens.black,
          borderRight: `1px solid ${tokens.border}`,
          backgroundImage: "none",
        },
      },
    },
    JoyChip: {
      styleOverrides: {
        root: ({ ownerState, theme: t }) => ({
          borderRadius: t.vars.radius.xs,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          ...(ownerState.size === "sm" && { fontSize: "0.6875rem", minHeight: 20 }),
          ...(ownerState.size === "md" && { fontSize: "0.75rem", minHeight: 24 }),
        }),
      },
    },
    JoyDivider: {
      styleOverrides: {
        // Only the rule itself is tinted — setting backgroundColor here would
        // paint the whole box and swallow any child label ("or" separators).
        root: {
          "--Divider-lineColor": tokens.border,
          color: tokens.textTertiary,
        },
      },
    },
    JoyTooltip: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          backgroundColor: tokens.level2,
          border: `1px solid ${tokens.border}`,
          borderRadius: t.vars.radius.sm,
          color: tokens.textPrimary,
          fontSize: "0.75rem",
          fontWeight: 400,
          boxShadow: t.vars.shadow.md,
        }),
      },
    },
    JoyTabList: {
      styleOverrides: {
        root: {
          "--TabList-gap": "2px",
          backgroundColor: "transparent",
          borderRadius: 0,
          padding: 0,
          borderBottom: `1px solid ${tokens.border}`,
        },
      },
    },
    JoyTab: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: tokens.textSecondary,
          fontSize: "0.875rem",
          fontWeight: 500,
          borderRadius: 0,
          paddingInline: 12,
          paddingBlock: 10,
          borderBottom: "2px solid transparent",
          marginBottom: "-1px",
          transition: "color 150ms ease, border-color 150ms ease",
          "&:hover": { backgroundColor: "transparent", color: tokens.textPrimary },
          "&[aria-selected='true']": {
            backgroundColor: "transparent",
            color: tokens.textPrimary,
            borderBottomColor: tokens.textPrimary,
            fontWeight: 500,
          },
          "&::after": { display: "none" },
          "&:focus-visible": focusVisible,
        },
      },
    },
    JoyTable: {
      styleOverrides: {
        root: {
          "--TableCell-borderColor": tokens.border,
          "--TableCell-headBackground": tokens.surface,
          "--TableRow-hoverBackground": tokens.level1,
          fontSize: "0.875rem",
          "& thead th": {
            color: tokens.textSecondary,
            fontWeight: 500,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          },
        },
      },
    },
    JoyLinearProgress: {
      styleOverrides: {
        root: {
          "--LinearProgress-radius": "999px",
          "--LinearProgress-thickness": "3px",
          backgroundColor: tokens.level2,
          color: tokens.textPrimary,
        },
      },
    },
    JoyCircularProgress: {
      styleOverrides: {
        root: {
          "--CircularProgress-trackColor": tokens.level2,
          color: tokens.textPrimary,
        },
      },
    },
    JoyAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.level2,
          color: tokens.textPrimary,
          border: `1px solid ${tokens.border}`,
          fontSize: "0.8125rem",
          fontWeight: 500,
        },
      },
    },
    JoySkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.level1,
          "&::before": { display: "none" },
          "&::after": { display: "none" },
        },
      },
    },
    JoyLink: {
      styleOverrides: {
        root: {
          color: tokens.textPrimary,
          textDecorationColor: tokens.borderHover,
          transition: "color 150ms ease",
          "&:hover": { color: "#ffffff" },
          "&:focus-visible": focusVisible,
        },
      },
    },
    JoyFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "0.8125rem",
          fontWeight: 500,
          color: tokens.textPrimary,
          marginBottom: 6,
        },
      },
    },
    JoyFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
          color: tokens.textTertiary,
          marginTop: 6,
        },
      },
    },
    JoySwitch: {
      styleOverrides: {
        root: {
          "--Switch-trackBackground": tokens.level2,
          "--Switch-trackBorderColor": tokens.border,
          "&:hover": { "--Switch-trackBackground": "#222222" },
          "&.Mui-checked": {
            "--Switch-trackBackground": "#ffffff",
            "--Switch-thumbBackground": "#000000",
            "&:hover": { "--Switch-trackBackground": "#e5e5e5" },
          },
          "&:focus-within": focusVisible,
        },
      },
    },
    JoyCheckbox: {
      styleOverrides: {
        checkbox: ({ theme: t }) => ({
          borderRadius: t.vars.radius.xs,
          borderColor: tokens.borderHover,
          backgroundColor: tokens.surface,
          "&.Mui-checked": {
            backgroundColor: "#ffffff",
            color: "#000000",
            borderColor: "#ffffff",
          },
        }),
      },
    },
    JoyRadio: {
      styleOverrides: {
        radio: {
          borderColor: tokens.borderHover,
          backgroundColor: tokens.surface,
        },
      },
    },
    JoyAlert: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: t.vars.radius.md,
          fontSize: "0.875rem",
          alignItems: "flex-start",
        }),
      },
    },
    JoyOption: {
      styleOverrides: {
        root: ({ theme: t }) => ({
          borderRadius: t.vars.radius.xs,
          fontSize: "0.875rem",
        }),
      },
    },
  },
});

export default theme;
