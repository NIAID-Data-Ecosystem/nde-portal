import { render } from '@testing-library/react';
import { SavedDataErrorToast } from './saved-data-error-toast';
import { useUserData } from 'src/hooks/useUserData';

// The component only uses `useToast` from Chakra and renders null, so a minimal
// module mock keeps the test light.
const mockToast = Object.assign(jest.fn(), {
  isActive: jest.fn(() => false),
});
jest.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

jest.mock('src/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

const mockUseUserData = useUserData as jest.Mock;

describe('SavedDataErrorToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.isActive.mockReturnValue(false);
  });

  it('fires an error toast and clears the error when one is present', () => {
    const clearError = jest.fn();
    const message = `Couldn't save "Malaria Atlas". Please try again.`;
    mockUseUserData.mockReturnValue({ error: message, clearError });

    render(<SavedDataErrorToast />);

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        id: message,
        title: message,
        status: 'error',
        isClosable: true,
      }),
    );
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it('does not toast a duplicate that is already active', () => {
    mockToast.isActive.mockReturnValue(true);
    const clearError = jest.fn();
    mockUseUserData.mockReturnValue({
      error: 'Something failed. Please try again.',
      clearError,
    });

    render(<SavedDataErrorToast />);

    expect(mockToast).not.toHaveBeenCalled();
    // Still consumes the error so it doesn't linger.
    expect(clearError).toHaveBeenCalledTimes(1);
  });

  it('does nothing when there is no error', () => {
    const clearError = jest.fn();
    mockUseUserData.mockReturnValue({ error: null, clearError });

    render(<SavedDataErrorToast />);

    expect(mockToast).not.toHaveBeenCalled();
    expect(clearError).not.toHaveBeenCalled();
  });
});
