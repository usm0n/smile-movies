import hotToast, { Toaster as HotToaster, ToastOptions } from "react-hot-toast";
import { tokens, fontStack } from "../../theme";

const base: ToastOptions = {
  duration: 4000,
  position: "bottom-center",
  style: {
    background: tokens.surface,
    color: tokens.textPrimary,
    border: `1px solid ${tokens.border}`,
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.75)",
    fontFamily: fontStack,
    fontSize: "14px",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    padding: "10px 14px",
    maxWidth: "420px",
  },
};

/**
 * All app toasts go through here so they share the Vercel look: dark bordered
 * card, tight radius, small monochrome status dot instead of a bright emoji.
 */
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    hotToast.success(message, {
      ...base,
      ...options,
      iconTheme: { primary: tokens.green, secondary: tokens.black },
    }),
  error: (message: string, options?: ToastOptions) =>
    hotToast.error(message, {
      ...base,
      ...options,
      iconTheme: { primary: tokens.red, secondary: tokens.black },
    }),
  loading: (message: string, options?: ToastOptions) =>
    hotToast.loading(message, { ...base, ...options }),
  message: (message: string, options?: ToastOptions) =>
    hotToast(message, { ...base, ...options }),
  dismiss: hotToast.dismiss,
  promise: hotToast.promise,
};

export function Toaster() {
  return (
    <HotToaster
      position="bottom-center"
      gutter={10}
      toastOptions={{
        ...base,
        success: { iconTheme: { primary: tokens.green, secondary: tokens.black } },
        error: { iconTheme: { primary: tokens.red, secondary: tokens.black } },
      }}
    />
  );
}

export default toast;
