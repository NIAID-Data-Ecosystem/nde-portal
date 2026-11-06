import { UserAccount } from 'src/hooks/useUserData/types';
import { getEmailToggleState, TOGGLES_COPY } from './';

const account = (fields: Partial<UserAccount>): UserAccount => ({
  created: '',
  email: '',
  linked_accounts: [],
  name: '',
  oauth_provider: '',
  updated: '',
  username: '',
  ...fields,
});

describe('getEmailToggleState', () => {
  it('enables email updates when the account has an email', () => {
    const state = getEmailToggleState(
      account({ oauth_provider: 'Okta', idp: 'orcid', email: 'a@example.org' }),
    );

    expect(state).toEqual({
      hasEmail: true,
      alert: undefined,
      isDisabled: false,
    });
  });

  it.each([
    ['ORCID', { oauth_provider: 'ORCID' }],
    ['NIH Login through ORCID', { oauth_provider: 'Okta', idp: 'orcid' }],
  ])(
    'points %s users without an email to their ORCID settings',
    (_label, fields) => {
      const state = getEmailToggleState(account(fields));

      expect(state.isDisabled).toBe(true);
      expect(state.alert).toBe(
        TOGGLES_COPY.emailUpdates.alerts.missingOrcidEmail,
      );
    },
  );

  it('shows other users without an email the generic alert', () => {
    const state = getEmailToggleState(
      account({ oauth_provider: 'Okta', idp: 'google' }),
    );

    expect(state.alert).toBe(TOGGLES_COPY.emailUpdates.alerts.missingEmail);
  });
});
