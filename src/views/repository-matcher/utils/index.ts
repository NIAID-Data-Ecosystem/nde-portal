import { RepositoryMatcherItem } from 'src/views/repository-matcher/types';

export const itemTypes = (item: RepositoryMatcherItem): string[] => {
  const t = 'type' in item ? item.type : undefined;
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') return [t];
  return [];
};
