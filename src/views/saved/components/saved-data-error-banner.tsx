import { Alert } from 'src/components/alert';
import { useUserData } from 'src/hooks/useUserData';

/**
 * Surfaces the last failed saved-items action (save/remove of a query or
 * resource) as a dismissible banner, so a failed request — e.g. the favorites
 * API rejecting a delete — isn't silent. Reads shared state from `useUserData`,
 * so it reflects failures from any consumer and clears on the next success.
 * Mirrors the `LoginErrorBanner` styling for consistency.
 */
export const SavedDataErrorAlert = () => {
  const { error, clearError } = useUserData();

  if (!error) return null;
  return <Alert status='error' title={error} size='sm' onClose={clearError} />;
};
