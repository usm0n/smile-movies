import { useCallback, useState } from "react";
import {
  FederatedProvider,
  describeFirebaseError,
  isFirebaseConfigured,
  signInWithProvider,
} from "../../service/firebase";
import { connectorsAPI } from "../../service/api/smb/connectors.api.service";
import { toast } from "../ui/toast";
import type { Location } from "../../user";

/**
 * Drives the Google/Apple popup for both sign-in and connect-from-settings.
 * `pending` names the provider currently in flight so only that button shows a
 * spinner, and a cancelled popup resolves quietly rather than as an error.
 */
export function useFederatedSignIn({
  onSuccess,
  mode = "signin",
  deviceLocation,
}: {
  onSuccess?: (result: { created?: boolean }) => void;
  mode?: "signin" | "link";
  deviceLocation?: Location;
} = {}) {
  const [pending, setPending] = useState<FederatedProvider | null>(null);

  const start = useCallback(
    async (provider: FederatedProvider) => {
      if (!isFirebaseConfigured) {
        toast.error("Sign-in with Google and Apple is not configured yet.");
        return;
      }

      setPending(provider);
      try {
        const result = await signInWithProvider(provider);

        if (mode === "link") {
          await connectorsAPI.linkFirebase(result.idToken);
          onSuccess?.({});
          return;
        }

        const response = await connectorsAPI.signInWithFirebase(
          result.idToken,
          { firstname: result.firstname, lastname: result.lastname },
          deviceLocation,
        );
        onSuccess?.({ created: response.created });
      } catch (error) {
        // API errors already surface through the axios interceptor; only
        // Firebase-side failures need to be described here.
        const message = describeFirebaseError(error);
        if (message) toast.error(message);
      } finally {
        setPending(null);
      }
    },
    [deviceLocation, mode, onSuccess],
  );

  return { start, pending, isConfigured: isFirebaseConfigured };
}
