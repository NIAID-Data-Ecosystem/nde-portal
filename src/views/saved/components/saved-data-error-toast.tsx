import { useEffect } from 'react';
import { toaster } from 'src/components/toaster';
import { useUserData } from 'src/hooks/useUserData';

/**
 * Surfaces the shared saved-items error (the same `error` the banner reads) as a
 * Chakra toast, for pages where an inline banner would be intrusive — e.g. the
 * search and resource pages, where saving happens via a small bookmark button.
 *
 * It shows the message once, then clears the shared error so it can't re-fire or
 * leak onto another page (e.g. the /saved banner). The `id` keyed on the message
 * dedupes repeats (and guards against StrictMode's double-invoked effects).
 * Renders nothing.
 */
export const SavedDataErrorToast = () => {
  const { error, clearError } = useUserData();

  useEffect(() => {
    if (!error) return;
    if (error) {
      toaster.create({
        title: error,
        type: 'error',
        description:
          'An error occurred while saving your data. Please try again.',
        closable: true,
      });
    }
    clearError();
  }, [error, clearError]);

  return null;
};
