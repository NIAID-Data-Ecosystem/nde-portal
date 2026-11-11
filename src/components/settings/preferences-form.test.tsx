import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { UserDataProvider } from 'src/hooks/useUserData';
import {
  PREFERENCES_FORM_COPY,
  PreferencesForm,
  PreferencesFormProps,
  PreferencesFormSection,
} from './preferences-form';

/**
 * Runs against the real UserDataProvider. In Jest NODE_ENV is "test", so the
 * provider takes the real fetch path; `global.fetch` is replaced with a small
 * in-memory `/user/data` server so the tests can assert on what is (and isn't)
 * sent.
 */

const SECTIONS: PreferencesFormSection[] = [
  {
    title: 'Communication preferences',
    toggleKeys: ['emailUpdates', 'feedbackTesting', 'betaFeatures'],
  },
  { title: 'Search preferences', toggleKeys: ['aiSearch'] },
];

const SAVED_PROFILE = {
  email: 'user@example.com',
  oauth_provider: 'GitHub',
  ai_toggle_preference: true,
  beta: false,
  contact_preference: true,
  feedback_preference: false,
  onboarding_complete: true,
};

const createServer = (
  profile: Record<string, unknown> = SAVED_PROFILE,
  { failPut = false } = {},
) => {
  let stored = { ...profile };
  const putBodies: Record<string, unknown>[] = [];
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const method = init?.method ?? 'GET';
    let status = 404;
    let body: unknown = { error: 'not found' };
    if (path === '/user/data' && method === 'GET') {
      status = 200;
      body = stored;
    } else if (path === '/user/data' && method === 'PUT') {
      const parsed = JSON.parse(String(init?.body));
      putBodies.push(parsed);
      if (failPut) {
        status = 500;
      } else {
        stored = { ...stored, ...parsed };
        status = 200;
        body = stored;
      }
    }
    return Promise.resolve({
      status,
      ok: status === 200,
      text: async () => JSON.stringify(body),
    } as Response);
  });
  return { fetchMock, putBodies };
};

const renderForm = async (props: Partial<PreferencesFormProps> = {}) => {
  render(
    <UserDataProvider>
      <PreferencesForm sections={SECTIONS} {...props} />
    </UserDataProvider>,
  );
  // The Settings variant keeps Save disabled until a change, so wait on the
  // loaded values instead of the button.
  await waitFor(() => expect(toggle('AI-assisted search').checked).toBe(true));
};

// Let any request a toggle might have started (writes first await an XSRF
// token fetch) reach the fake server before asserting nothing was sent.
const flushRequests = () =>
  act(() => new Promise<void>(resolve => setTimeout(resolve, 0)));

const toggle = (label: string) =>
  screen.getByRole('checkbox', { name: label }) as HTMLInputElement;

const saveButton = () =>
  screen.getByRole('button', { name: PREFERENCES_FORM_COPY.saveButton });

const toggleStates = () => ({
  email: toggle('Email Updates').checked,
  feedback: toggle('Feedback and Testing').checked,
  beta: toggle('Beta features').checked,
  ai: toggle('AI-assisted search').checked,
});

const save = async () => {
  await act(async () => {
    fireEvent.click(saveButton());
  });
};

describe('PreferencesForm', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Silence the provider's [favorites test] console grouping.
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('shows saved preferences and sends nothing until Save is pressed', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm();

    expect(toggleStates()).toEqual({
      email: true,
      feedback: false,
      beta: false,
      ai: true,
    });

    fireEvent.click(toggle('Beta features'));
    fireEvent.click(toggle('AI-assisted search'));

    expect(toggle('Beta features').checked).toBe(true);
    expect(toggle('AI-assisted search').checked).toBe(false);
    await flushRequests();
    expect(server.putBodies).toHaveLength(0);
  });

  it('enables Save only while there are unsaved changes', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm();

    expect(saveButton()).toBeDisabled();

    fireEvent.click(toggle('Beta features'));
    expect(saveButton()).toBeEnabled();

    fireEvent.click(toggle('Beta features'));
    expect(saveButton()).toBeDisabled();
  });

  it('saves every toggle in one request, then confirms it', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    const onSaved = jest.fn();
    await renderForm({ onSaved });

    fireEvent.click(toggle('Beta features'));
    fireEvent.click(toggle('AI-assisted search'));
    await save();

    expect(server.putBodies).toHaveLength(1);
    expect(server.putBodies[0]).toEqual({
      ai_toggle_preference: false,
      beta: true,
      contact_preference: true,
      feedback_preference: false,
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      PREFERENCES_FORM_COPY.saved,
    );
    // The saved values are now the baseline, so there's nothing left to save.
    expect(saveButton()).toBeDisabled();

    // Editing again clears the confirmation.
    fireEvent.click(toggle('Feedback and Testing'));
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('forwards save options to the request', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm({ saveOptions: { completeOnboarding: true } });

    fireEvent.click(toggle('Beta features'));
    await save();

    expect(server.putBodies[0]).toMatchObject({
      beta: true,
      onboarding_complete: true,
    });
  });

  it('starts from initialValues and can save them unchanged', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm({
      initialValues: { beta: true, feedback_preference: true },
      allowUnchangedSave: true,
    });

    expect(toggleStates()).toEqual({
      email: true,
      feedback: true,
      beta: true,
      ai: true,
    });

    fireEvent.click(toggle('Beta features'));
    fireEvent.click(toggle('Feedback and Testing'));
    // Back to the saved values, but Save stays available.
    expect(saveButton()).toBeEnabled();
    await save();
    expect(server.putBodies).toHaveLength(1);
  });

  it('keeps email updates off when the account has no email', async () => {
    const server = createServer({ ...SAVED_PROFILE, email: '' });
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm();

    // Saved as on, but shown (and saved) as off.
    expect(toggle('Email Updates').checked).toBe(false);
    expect(toggle('Email Updates')).toBeDisabled();
    expect(
      screen.getByText(/does not have an email address on record/i),
    ).toBeInTheDocument();
    // The forced-off value doesn't count as an unsaved change.
    expect(saveButton()).toBeDisabled();

    fireEvent.click(toggle('Beta features'));
    await save();
    expect(server.putBodies[0]).toMatchObject({
      beta: true,
      contact_preference: false,
    });
  });

  it('shows an error and keeps the edits when the save fails', async () => {
    const server = createServer(SAVED_PROFILE, { failPut: true });
    global.fetch = server.fetchMock as unknown as typeof fetch;
    const onSaved = jest.fn();
    await renderForm({ onSaved });

    fireEvent.click(toggle('Beta features'));
    await save();

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't save your preferences. Please try again.",
    );
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(onSaved).not.toHaveBeenCalled();
    expect(toggle('Beta features').checked).toBe(true);
    expect(saveButton()).toBeEnabled();
  });
});
