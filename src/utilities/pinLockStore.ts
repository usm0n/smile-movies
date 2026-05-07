// Persists lock state per-device so PIN is required after refresh
// when requirePassword is set to "immediately" or a timed option

const LOCK_KEY = "smile_account_locked";
const LOCK_TIME_KEY = "smile_account_locked_at";
export const DEVICE_ID_KEY = "smile_device_id";

export const pinLockStore = {
  lock(): void {
    localStorage.setItem(LOCK_KEY, "1");
    localStorage.setItem(LOCK_TIME_KEY, String(Date.now()));
  },

  unlock(): void {
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(LOCK_TIME_KEY);
  },

  isLocked(requirePassword: string = "never"): boolean {
    const locked = localStorage.getItem(LOCK_KEY);
    if (!locked) return false;

    if (requirePassword === "never") {
      // Auto-unlock if policy changed to never
      this.unlock();
      return false;
    }

    if (requirePassword === "immediately") return true;

    const lockedAt = Number(localStorage.getItem(LOCK_TIME_KEY) || 0);
    const elapsedMs = Date.now() - lockedAt;

    if (requirePassword === "5min" && elapsedMs < 5 * 60 * 1000) return true;
    if (requirePassword === "30min" && elapsedMs < 30 * 60 * 1000) return true;

    // Custom (minutes stored as number string)
    const customMin = Number(requirePassword);
    if (!isNaN(customMin) && elapsedMs < customMin * 60 * 1000) return true;

    // Timeout elapsed — auto-unlock
    this.unlock();
    return false;
  },

  // Call when user navigates away or app goes to background
  lockIfRequired(requirePassword: string = "never"): void {
    if (requirePassword === "never") return;
    this.lock();
  },
};
