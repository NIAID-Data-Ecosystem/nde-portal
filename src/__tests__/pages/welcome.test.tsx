import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import WelcomePage from 'src/pages/welcome';
import { UserPreferences } from 'src/hooks/useUserData/types';

const mockUseUserData = jest.fn();

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: () => ({ replace: jest.fn(), pathname: '/welcome' }),
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

const toggleStates = () => ({
  email: toggle('Email Updates').checked,
  feedback: toggle('Feedback and Testing').checked,
  beta: toggle('Beta features').checked,
});

describe('WelcomePage', () => {
  beforeEach(() => mockUseUserData.mockReset());

  it('shows the opt-in defaults for users who have not onboarded', () => {
    mockUseUserData.mockReturnValue(userData());
    render(<WelcomePage />);
    expect(toggleStates()).toEqual({
      email: true,
      feedback: true,
      beta: false,
    });
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

  it("doesn't overwrite the user's edits when preferences change later", () => {
    mockUseUserData.mockReturnValue(userData({ onboardingComplete: true }));
    const { rerender } = render(<WelcomePage />);

    fireEvent.click(toggle('Feedback and Testing'));
    expect(toggle('Feedback and Testing').checked).toBe(true);

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
});
