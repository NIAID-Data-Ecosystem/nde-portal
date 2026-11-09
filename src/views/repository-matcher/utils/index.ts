import { RepositoryMatcherItem } from 'src/views/repository-matcher/types';
import { getTabIdFromResourceType } from 'src/views/search/config/tabs';

export const itemTypes = (item: RepositoryMatcherItem): string[] => {
  const t = 'type' in item ? item.type : undefined;
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') return [t];
  return [];
};
