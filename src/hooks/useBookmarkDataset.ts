import { useCallback } from 'react';
import { useAuth } from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/useUserData';

interface UseBookmarkDatasetArgs {
  id?: string | null;
  name?: string | null;
}

/**
 * Save/unsave state for a single dataset, shared by every "bookmark this
 * resource" button (search result cards, the resource page header).
 *
 * Bookmarking requires an account, so a logged-out user is sent to login
 * instead of having the toggle silently do nothing.
 */
export const useBookmarkDataset = ({ id, name }: UseBookmarkDatasetArgs) => {
  const { user, login } = useAuth();
  const { savedDatasets, addSavedDataset, removeSavedDataset } = useUserData();

  const isFavorited = id
    ? savedDatasets.some(dataset => dataset.dataset_id === id)
    : false;

  const toggleBookmark = useCallback(() => {
    if (!id) return;
    if (!user) {
      login();
      return;
    }
    if (isFavorited) {
      removeSavedDataset(id);
    } else {
      addSavedDataset({
        dataset_id: id,
        name: name || 'Untitled Dataset',
        saved_at: new Date().toISOString(),
      });
    }
  }, [addSavedDataset, id, isFavorited, login, name, removeSavedDataset, user]);

  return {
    isFavorited,
    toggleBookmark,
    // Nothing to save without an id, so the trigger should be inert.
    isDisabled: !id,
  };
};
