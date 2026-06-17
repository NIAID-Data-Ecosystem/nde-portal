export type UserPreferences = {
  ai_toggle_preference: boolean;
  beta: boolean;
  contact_preference: boolean;
  feedback_preference: boolean;
};

export type UserPreferencesKeys = keyof UserPreferences;

export type SavedQuery = {
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
  email: string;
};
