export type UserPreferences = {
  ai_toggle_preference: boolean;
  beta: boolean;
  contact_preference: boolean;
  feedback_preference: boolean;
};

export type UserPreferencesKeys = keyof UserPreferences;

export type SavedQuery = {
  total: number;
  query: string;
  name: string;
  saved_at?: string;
  filters: Record<string, any>;
};

export type SavedDataset = {
  dataset_id: string;
  name: string;
  saved_at?: string;
};

export type UserProfile = UserPreferences & {
  username: string;
  oauth_provider: string;
  linked_accounts: string[];
  favorite_searches: SavedQuery[];
  favorite_datasets: SavedDataset[];
  created: string;
  updated: string;
  name: string;
  email?: string;
  // NIH Login only: the provider the user signed in through ('orcid',
  // 'google', 'microsoft' or 'nih').
  idp?: string;
  // Set to true once the user saves settings on the welcome page. Kept out of
  // UserPreferences so Settings page toggles never re-send (and overwrite) it.
  onboarding_complete?: boolean;
};

export type SavePreferencesOptions = {
  // Also mark onboarding complete (welcome page's "Save Settings").
  completeOnboarding?: boolean;
};

// Account-level profile fields from the /user/data route (not preferences or
// saved items) — the subset the UI needs for account/settings display.
export type UserAccount = Pick<
  UserProfile,
  | 'created'
  | 'email'
  | 'idp'
  | 'linked_accounts'
  | 'name'
  | 'oauth_provider'
  | 'updated'
  | 'username'
>;
