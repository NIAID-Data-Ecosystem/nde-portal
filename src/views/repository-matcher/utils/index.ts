import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-string';
import { RepositoryMatcherItem } from 'src/views/repository-matcher/types';
import { getTabIdFromResourceType } from 'src/views/search/config/tabs';

export const itemTypes = (item: RepositoryMatcherItem): string[] => {
  const t = 'type' in item ? item.type : undefined;
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') return [t];
  return [];
};

export const buildItemUrl = (item: RepositoryMatcherItem): string => {
  const id = item.identifier || '';
  if (!id) return '';
  const types = itemTypes(item);
  if (types.includes('Resource Catalog')) {
    return `/resources?id=${encodeURIComponent(id)}`;
  }
  const filters = queryFilterObject2String({
    'includedInDataCatalog.name': [id],
  });
  const params = new URLSearchParams();
  params.set('q', '');
  if (filters) params.set('filters', filters);
  // set tab based on type
  if (types.includes('Computational Tool Repository')) {
    const tab = getTabIdFromResourceType('ComputationalTool');
    if (tab) params.set('tab', tab);
  } else if (types.includes('Sample Repository')) {
    const tab = getTabIdFromResourceType('Sample');
    if (tab) params.set('tab', tab);
  }
  return `/search?${params.toString()}`;
};
