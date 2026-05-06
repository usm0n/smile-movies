// Stores minimal info about previously logged-in accounts for the Switch Accounts UI.
// The actual auth is cookie-based; this is display-only metadata.

const STORAGE_KEY = "smile_saved_accounts";

export interface SavedAccount {
  id: string;
  email: string;
  firstname: string;
  lastname?: string;
  profilePic?: string;
  handle?: string;
  savedAt: number;
}

export const savedAccountsManager = {
  getAll(): SavedAccount[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  },

  upsert(account: Omit<SavedAccount, "savedAt">): void {
    const all = this.getAll().filter((a) => a.id !== account.id);
    all.unshift({ ...account, savedAt: Date.now() });
    // Keep max 5 accounts
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 5)));
  },

  remove(id: string): void {
    const all = this.getAll().filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
