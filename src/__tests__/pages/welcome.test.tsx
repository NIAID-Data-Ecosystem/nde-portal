import React from 'react';
import { act, fireEvent, render, screen } from 'src/__tests__/utils/render';
import { UserPreferences } from 'src/hooks/useUserData/types';
import WelcomePage from 'src/pages/welcome';

const mockUseUserData = jest.fn();
const mockReplace = jest.fn();

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({ replace: mockReplace, pathname: '/welcome' }),
}));

jest.mock('src/hooks/useAuth', () => ({
  useAuth: () => ({ user: { oauth_provider: 'github' } }),
}));

jest.mock('src/hooks/useUserData', () => ({
  useUserData: () => mockUseUserData(),
}));

jest.mock('src/components/auth/withAuth', () => ({
  withAuth: (Component: React.ComponentType) => Component,
}));

jest.mock('src/utils/feature-flags', () => ({
  ENABLE_AUTH: true,
  SHOW_WELCOME_PAGE: true,
}));

jest.mock('src/components/page-container', () => ({
  getPageSeoConfig: () => ({}),
  PageContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const SAVED_PREFERENCES: UserPreferences = {
  ai_toggle_preference: false,
  beta: true,
  contact_preference: false,
  feedback_preference: false,
};

const userData = (overrides: Record<string, unknown> = {}) => ({
  account: { email: 'user@example.com', oauth_provider: 'github' },
  error: null,
  hasLoadedProfile: true,
  onboardingComplete: false,
  preferences: SAVED_PREFERENCES,
  savePreferences: jest.fn(),
  ...overrides,
});

const toggle = (label: string) =>
  screen.getByRole('checkbox', { name: label }) as HTMLInputElement;

// zag applies a switch change in a microtask, so click inside an async act to
// let it (and the form's state update) land before asserting.
const clickToggle = (label: string) =>
  act(async () => {
    fireEvent.click(toggle(label));
  });

const toggleStates = () => ({
  email: toggle('Email updates').checked,
  feedback: toggle('Feedback and testing').checked,
  beta: toggle('Beta features').checked,
});

describe('WelcomePage', () => {
  beforeEach(() => {
    mockUseUserData.mockReset();
    mockReplace.mockReset();
    sessionStorage.clear();
  });

  it('shows the opt-in defaults for users who have not onboarded', () => {
    mockUseUserData.mockReturnValue(userData());
    render(<WelcomePage />);
    expect(toggleStates()).toEqual({
      email: true,
      feedback: true,
      beta: false,
    });
  });

  it('shows the opt-in defaults, disabled, while the profile loads', () => {
    mockUseUserData.mockReturnValue(
      userData({
        account: null,
        hasLoadedProfile: false,
        onboardingComplete: null,
      }),
    );
    render(<WelcomePage />);

    // Not forced off by the (still unknown) email, and no email alert yet.
    expect(toggleStates()).toEqual({
      email: true,
      feedback: true,
      beta: false,
    });
    expect(toggle('Email updates')).toBeDisabled();
    expect(screen.queryByText(/email address/i)).not.toBeInTheDocument();
  });

  it('shows saved preferences for users who already completed onboarding', () => {
    mockUseUserData.mockReturnValue(userData({ onboardingComplete: true }));
    render(<WelcomePage />);
    expect(toggleStates()).toEqual({
      email: false,
      feedback: false,
      beta: true,
    });
  });

  it('seeds saved preferences once the profile finishes loading', () => {
    mockUseUserData.mockReturnValue(
      userData({ hasLoadedProfile: false, onboardingComplete: null }),
    );
    const { rerender } = render(<WelcomePage />);
    expect(
      screen.getByRole('button', { name: 'Save Settings' }),
    ).toBeDisabled();

    mockUseUserData.mockReturnValue(userData({ onboardingComplete: true }));
    rerender(<WelcomePage />);
    expect(toggleStates()).toEqual({
      email: false,
      feedback: false,
      beta: true,
    });
    expect(screen.getByRole('button', { name: 'Save Settings' })).toBeEnabled();
  });

  it("doesn't overwrite the user's edits when preferences change later", async () => {
    mockUseUserData.mockReturnValue(userData({ onboardingComplete: true }));
    const { rerender } = render(<WelcomePage />);

    await clickToggle('Feedback and testing');
    expect(toggle('Feedback and testing').checked).toBe(true);

    mockUseUserData.mockReturnValue(
      userData({
        onboardingComplete: true,
        preferences: { ...SAVED_PREFERENCES, beta: false },
      }),
    );
    rerender(<WelcomePage />);
    expect(toggleStates()).toEqual({
      email: false,
      feedback: true,
      beta: true,
    });
  });

  it('saves the selected toggles, completes onboarding and returns the user', async () => {
    const savePreferences = jest.fn().mockResolvedValue({ ok: true });
    mockUseUserData.mockReturnValue(userData({ savePreferences }));
    sessionStorage.setItem('auth_return_to', '/search?q=malaria');
    render(<WelcomePage />);

    await clickToggle('Beta features');
    expect(savePreferences).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
    });

    expect(savePreferences).toHaveBeenCalledTimes(1);
    expect(savePreferences).toHaveBeenCalledWith(
      { contact_preference: true, feedback_preference: true, beta: true },
      { completeOnboarding: true },
    );
    expect(mockReplace).toHaveBeenCalledWith('/search?q=malaria');
    expect(sessionStorage.getItem('auth_return_to')).toBeNull();
  });

  it('turns off the opt-in defaults when the account has no email', async () => {
    const savePreferences = jest.fn().mockResolvedValue({ ok: true });
    mockUseUserData.mockReturnValue(
      userData({
        account: { email: '', oauth_provider: 'github' },
        savePreferences,
      }),
    );
    render(<WelcomePage />);

    expect(toggleStates()).toEqual({
      email: false,
      feedback: false,
      beta: false,
    });
    expect(toggle('Feedback and testing')).toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
    });
    expect(savePreferences).toHaveBeenCalledWith(
      { contact_preference: false, feedback_preference: false, beta: false },
      { completeOnboarding: true },
    );
  });

  it('stays on the page when the save fails', async () => {
    const savePreferences = jest.fn().mockResolvedValue({ ok: false });
    mockUseUserData.mockReturnValue(userData({ savePreferences }));
    render(<WelcomePage />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save Settings' }));
    });

    expect(savePreferences).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
