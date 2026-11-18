import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'src/__tests__/utils/render';
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
  { failGet = false, failPut = false } = {},
) => {
  let stored = { ...profile };
  const putBodies: Record<string, unknown>[] = [];
  const fetchMock = jest.fn((url: string, init?: RequestInit) => {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    const method = init?.method ?? 'GET';
    let status = 404;
    let body: unknown = { error: 'not found' };
    if (path === '/user/data' && method === 'GET') {
      status = failGet ? 500 : 200;
      body = failGet ? { error: 'Internal Server Error' } : stored;
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

// Hold the form's `/user/data` requests of one method until released, to check
// the in-between state.
const holdRequests = (fetchMock: jest.Mock, method: 'GET' | 'PUT') => {
  let release!: () => void;
  const released = new Promise<void>(resolve => {
    release = resolve;
  });
  global.fetch = ((url: string, init?: RequestInit) =>
    url.endsWith('/user/data') && (init?.method ?? 'GET') === method
      ? released.then(() => fetchMock(url, init))
      : fetchMock(url, init)) as unknown as typeof fetch;
  return async () => {
    release();
    await flushRequests();
  };
};

const EMAIL_LABELS = ['Email updates', 'Feedback and testing', 'Beta features'];

const savedIcon = () =>
  screen.getByRole('status').parentElement?.querySelector('svg');

const toggle = (label: string) =>
  screen.getByRole('checkbox', { name: label }) as HTMLInputElement;

// zag applies a switch change in a microtask, so click inside an async act to
// let it (and the form's state update) land before asserting.
const clickToggle = (label: string) =>
  act(async () => {
    fireEvent.click(toggle(label));
  });

const saveButton = () =>
  screen.getByRole('button', { name: PREFERENCES_FORM_COPY.saveButton });

const toggleStates = () => ({
  email: toggle('Email updates').checked,
  feedback: toggle('Feedback and testing').checked,
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

    await clickToggle('Beta features');
    await clickToggle('AI-assisted search');

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

    await clickToggle('Beta features');
    expect(saveButton()).toBeEnabled();

    await clickToggle('Beta features');
    expect(saveButton()).toBeDisabled();
  });

  it('saves every toggle in one request, then confirms it', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    const onSaved = jest.fn();
    await renderForm({ onSaved });

    await clickToggle('Beta features');
    await clickToggle('AI-assisted search');
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
    expect(savedIcon()).toBeInTheDocument();
    // The saved values are now the baseline, so there's nothing left to save.
    expect(saveButton()).toBeDisabled();

    // Editing again clears the confirmation.
    await clickToggle('Feedback and testing');
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(savedIcon()).toBeFalsy();
  });

  it("doesn't confirm the save if a toggle changed while it was saving", async () => {
    const server = createServer();
    const releaseSave = holdRequests(server.fetchMock, 'PUT');
    await renderForm();

    await clickToggle('Beta features');
    await save();
    await clickToggle('Feedback and testing');
    await releaseSave();

    expect(server.putBodies).toHaveLength(1);
    // The later change is still unsaved, so neither the text nor the icon
    // claims the settings are saved.
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(savedIcon()).toBeFalsy();
    expect(saveButton()).toBeEnabled();
  });

  it('forwards save options to the request', async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm({ saveOptions: { completeOnboarding: true } });

    await clickToggle('Beta features');
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

    await clickToggle('Beta features');
    await clickToggle('Feedback and testing');
    // Back to the saved values, but Save stays available.
    expect(saveButton()).toBeEnabled();
    await save();
    expect(server.putBodies).toHaveLength(1);
  });

  it('turns off and disables every email toggle when the account has no email', async () => {
    const server = createServer({
      ...SAVED_PROFILE,
      email: '',
      // Saved as on, but shown (and saved) as off.
      contact_preference: true,
      feedback_preference: true,
      beta: true,
    });
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm();

    const alert = screen.getByText(/does not have an email address on record/i);
    for (const label of [
      'Email updates',
      'Feedback and testing',
      'Beta features',
    ]) {
      expect(toggle(label).checked).toBe(false);
      expect(toggle(label)).toBeDisabled();
      // The alert is above the toggles, so each switch points at it.
      expect(toggle(label)).toHaveAccessibleDescription(
        /does not have an email address on record/i,
      );
    }
    // Shown once, before the first email toggle.
    expect(
      screen.getAllByText(/does not have an email address on record/i),
    ).toHaveLength(1);
    expect(
      alert.compareDocumentPosition(toggle('Email updates')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // Not every toggle sends email.
    expect(toggle('AI-assisted search')).toBeEnabled();
    expect(toggle('AI-assisted search')).not.toHaveAccessibleDescription();
    // The forced-off values don't count as unsaved changes.
    expect(saveButton()).toBeDisabled();

    await clickToggle('AI-assisted search');
    await save();
    expect(server.putBodies[0]).toEqual({
      ai_toggle_preference: false,
      beta: false,
      contact_preference: false,
      feedback_preference: false,
    });
  });

  it('disables the toggles and holds back the email alert until the profile loads', async () => {
    const server = createServer({ ...SAVED_PROFILE, email: '' });
    const releaseProfile = holdRequests(server.fetchMock, 'GET');
    render(
      <UserDataProvider>
        <PreferencesForm
          sections={SECTIONS}
          initialValues={{ feedback_preference: true }}
        />
      </UserDataProvider>,
    );

    // The email is unknown, not missing: no alert, and the starting values
    // aren't forced off.
    expect(screen.queryByText(/email address/i)).not.toBeInTheDocument();
    expect(toggle('Feedback and testing').checked).toBe(true);
    for (const label of [...EMAIL_LABELS, 'AI-assisted search']) {
      expect(toggle(label)).toBeDisabled();
    }

    await releaseProfile();

    expect(
      screen.getByText(/does not have an email address on record/i),
    ).toBeInTheDocument();
    expect(toggle('Feedback and testing').checked).toBe(false);
    expect(toggle('Feedback and testing')).toBeDisabled();
    expect(toggle('AI-assisted search')).toBeEnabled();
  });

  it('keeps the email toggles off, without the email alert, if the profile fails to load', async () => {
    const server = createServer(SAVED_PROFILE, { failGet: true });
    global.fetch = server.fetchMock as unknown as typeof fetch;
    render(
      <UserDataProvider>
        <PreferencesForm sections={SECTIONS} />
      </UserDataProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /unable to load/i,
    );
    // Whether the account has an email is unknown, so don't claim it hasn't.
    expect(screen.queryByText(/email address/i)).not.toBeInTheDocument();
    for (const label of EMAIL_LABELS) {
      expect(toggle(label).checked).toBe(false);
      expect(toggle(label)).toBeDisabled();
      expect(toggle(label)).not.toHaveAccessibleDescription();
    }
    expect(toggle('AI-assisted search')).toBeEnabled();
  });

  it('shows the ORCID variant of the alert to ORCID accounts', async () => {
    const server = createServer({
      ...SAVED_PROFILE,
      email: '',
      oauth_provider: 'ORCID',
    });
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm();

    expect(
      screen.getByText(/couldn’t access a public email address/i),
    ).toBeInTheDocument();
    expect(toggle('Beta features')).toHaveAccessibleDescription(
      /couldn’t access a public email address/i,
    );
  });

  it("doesn't show the alert when the account has an email", async () => {
    const server = createServer();
    global.fetch = server.fetchMock as unknown as typeof fetch;
    await renderForm();

    expect(screen.queryByText(/email address/i)).not.toBeInTheDocument();
    expect(toggle('Beta features')).toBeEnabled();
    expect(toggle('Beta features')).not.toHaveAccessibleDescription();
  });

  it('shows an error and keeps the edits when the save fails', async () => {
    const server = createServer(SAVED_PROFILE, { failPut: true });
    global.fetch = server.fetchMock as unknown as typeof fetch;
    const onSaved = jest.fn();
    await renderForm({ onSaved });

    await clickToggle('Beta features');
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
