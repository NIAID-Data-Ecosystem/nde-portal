import { render } from '@testing-library/react';
import { StrictMode } from 'react';
import { toaster } from 'src/components/toaster';
import { useUserData } from 'src/hooks/useUserData';

import { SavedDataErrorToast } from './saved-data-error-toast';

// The real toaster is a plain store (no provider or DOM needed), so the tests
// assert on what it actually holds rather than on how it was called.
jest.mock('src/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

const mockUseUserData = useUserData as jest.Mock;

describe('SavedDataErrorToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    toaster.remove();
  });

  it('fires an error toast and clears the error when one is present', () => {
    const clearError = jest.fn();
    const message = `Couldn't save "Malaria Atlas". Please try again.`;
    mockUseUserData.mockReturnValue({ error: message, clearError });

    render(<SavedDataErrorToast />);

    const toasts = toaster.getVisibleToasts();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toEqual(
      expect.objectContaining({
        id: message,
        title: message,
        type: 'error',
        closable: true,
      }),
    );
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it('does not stack a duplicate of a toast that is already showing', () => {
    const clearError = jest.fn();
    const message = 'Something failed. Please try again.';
    mockUseUserData.mockReturnValue({ error: message, clearError });

    // StrictMode double-invokes the effect, toasting the same error twice.
    render(
      <StrictMode>
        <SavedDataErrorToast />
      </StrictMode>,
    );

    expect(toaster.getVisibleToasts()).toHaveLength(1);
    // Still consumes the error so it doesn't linger.
    expect(clearError).toHaveBeenCalled();
  });

  it('does nothing when there is no error', () => {
    const clearError = jest.fn();
    mockUseUserData.mockReturnValue({ error: null, clearError });

    render(<SavedDataErrorToast />);

    expect(toaster.getVisibleToasts()).toHaveLength(0);
    expect(clearError).not.toHaveBeenCalled();
  });
});
