/**
 * Preference toggles that only persist when the user presses Save. Toggling
 * changes a local draft; Save sends every toggle in the form in a single
 * request. Shared by the Settings and Welcome pages.
 */

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, chakra, HStack, Icon, Text } from '@chakra-ui/react';
import { useUserData } from 'src/hooks/useUserData';
import {
  SavePreferencesOptions,
  UserPreferences,
  UserPreferencesKeys,
} from 'src/hooks/useUserData/types';
import { SettingsSection } from './settings-section';
import {
  getEmailToggleState,
  SettingToggle,
  TOGGLE_TO_PREF,
  TOGGLES_COPY,
  ToggleKey,
} from './toggles';
import { FaCircleCheck } from 'react-icons/fa6';

export const PREFERENCES_FORM_COPY = {
  saveButton: 'Save Settings',
  saving: 'Saving',
  saved: 'Your settings have been saved.',
};

export interface PreferencesFormSection {
  title: ReactNode;
  subtitle?: ReactNode;
  toggleKeys: ToggleKey[];
}

export interface PreferencesFormProps {
  /** Toggle groups, each rendered under its own heading. Keep the array
   * stable (e.g. a module constant). */
  sections: PreferencesFormSection[];
  /**
   * Values to start the toggles from instead of the user's saved preferences,
   * e.g. opt-in defaults for first-time users. Like an input's `defaultValue`,
   * it's only read when the toggles are set up: on mount and once the profile
   * loads. Later changes never overwrite the user's in-progress edits.
   */
  initialValues?: Partial<UserPreferences>;
  saveLabel?: string;
  saveOptions?: SavePreferencesOptions;
  /**
   * Keep Save enabled when nothing has changed (the welcome page's save also
   * completes onboarding). By default Save is disabled until a toggle changes.
   */
  allowUnchangedSave?: boolean;
  /** Called after a successful save. */
  onSaved?: () => void;
  /** Called whenever the form gains or loses unsaved changes, e.g. to warn
   * before leaving the page. */
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

type PreferenceValues = Partial<Record<UserPreferencesKeys, boolean>>;

const pickValues = (
  source: Partial<UserPreferences>,
  keys: UserPreferencesKeys[],
): PreferenceValues =>
  Object.fromEntries(keys.map(key => [key, Boolean(source[key])]));

export function PreferencesForm({
  sections,
  initialValues,
  saveLabel = PREFERENCES_FORM_COPY.saveButton,
  saveOptions,
  allowUnchangedSave = false,
  onSaved,
  onUnsavedChangesChange,
}: PreferencesFormProps) {
  const { account, error, hasLoadedProfile, preferences, savePreferences } =
    useUserData();

  const prefKeys = useMemo(
    () =>
      sections.flatMap(section =>
        section.toggleKeys.map(key => TOGGLE_TO_PREF[key]),
      ),
    [sections],
  );

  // Toggles only change this draft; nothing is persisted until Save.
  const [draft, setDraft] = useState<PreferenceValues>(() =>
    pickValues({ ...preferences, ...initialValues }, prefKeys),
  );
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Re-seed once when the profile loads (unless it had already loaded on
  // mount), so the toggles show the real values rather than the pre-load ones.
  // Seed only once so later preference updates never overwrite edits.
  const hasSeededRef = useRef(hasLoadedProfile);
  useEffect(() => {
    if (!hasLoadedProfile || hasSeededRef.current) return;
    hasSeededRef.current = true;
    setDraft(pickValues({ ...preferences, ...initialValues }, prefKeys));
  }, [hasLoadedProfile, preferences, initialValues, prefKeys]);

  const emailToggle = getEmailToggleState(account);

  // Email updates can't be on without an email on the record, whatever the
  // draft or saved value says.
  const withEmailRule = (values: PreferenceValues): PreferenceValues =>
    emailToggle.isDisabled && 'contact_preference' in values
      ? { ...values, contact_preference: false }
      : values;

  const values = withEmailRule(draft);
  const savedValues = withEmailRule(pickValues(preferences, prefKeys));
  const hasChanges = prefKeys.some(key => values[key] !== savedValues[key]);

  useEffect(() => {
    onUnsavedChangesChange?.(hasChanges);
  }, [hasChanges, onUnsavedChangesChange]);

  // Per-toggle extras, keyed by toggle. Keeps the render loop generic rather
  // than special-casing individual toggles inline.
  const toggleExtras: Partial<
    Record<ToggleKey, { alert?: ReactNode; isDisabled?: boolean }>
  > = {
    emailUpdates: {
      alert: emailToggle.alert,
      isDisabled: emailToggle.isDisabled,
    },
  };

  const handleToggle = (key: ToggleKey, checked: boolean) => {
    setDraft(prev => ({ ...prev, [TOGGLE_TO_PREF[key]]: checked }));
    setStatus('idle');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    const result = await savePreferences(values, saveOptions);
    if (!result?.ok) {
      // The hook surfaces the failure through `error`.
      setStatus('idle');
      return;
    }
    setStatus('saved');
    onSaved?.();
  };

  return (
    <chakra.form onSubmit={handleSubmit} w='full'>
      {sections.map(section => (
        <SettingsSection
          key={section.toggleKeys.join()}
          title={section.title}
          subtitle={section.subtitle}
        >
          {section.toggleKeys.map((key, index) => (
            <SettingToggle
              key={key}
              label={TOGGLES_COPY[key].label}
              description={TOGGLES_COPY[key].description}
              isChecked={Boolean(values[TOGGLE_TO_PREF[key]])}
              onChange={checked => handleToggle(key, checked)}
              showBorder={index < section.toggleKeys.length - 1}
              {...toggleExtras[key]}
            />
          ))}
        </SettingsSection>
      ))}

      {error && (
        <Text color='red.600' fontSize='sm' mb={4} role='alert'>
          {error}
        </Text>
      )}

      <HStack gap={4} flexWrap='wrap'>
        <Button
          type='submit'
          colorScheme='primary'
          // Don't let a save send defaults before the real values have loaded.
          isDisabled={!hasLoadedProfile || (!allowUnchangedSave && !hasChanges)}
          isLoading={status === 'saving'}
          loadingText={PREFERENCES_FORM_COPY.saving}
        >
          {saveLabel}
        </Button>
        {/* Always mounted so screen readers announce the message when it
            appears. */}
        <HStack>
          {status == 'saved' && <Icon as={FaCircleCheck} color='primary.400' />}
          <Text role='status' color='primary.700' fontSize='sm'>
            {status === 'saved' && !hasChanges
              ? PREFERENCES_FORM_COPY.saved
              : ''}
          </Text>
        </HStack>
      </HStack>
    </chakra.form>
  );
}
