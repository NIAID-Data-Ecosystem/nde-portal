import { BrowserSettings } from '.';

export type LocalStorageConfig = {
  [key in keyof BrowserSettings]: boolean;
};

export const transformSettingsToLocalStorageConfig = (
  settings: BrowserSettings,
): LocalStorageConfig =>
  Object.fromEntries(
    Object.entries(settings).map(([key, setting]) => [key, setting.value]),
  ) as LocalStorageConfig;
