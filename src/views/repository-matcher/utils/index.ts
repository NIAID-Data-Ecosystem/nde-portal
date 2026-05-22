import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-string';
import { getTabIdFromTypeLabel } from 'src/views/search/components/filters/utils/tab-filter-utils';
import { RepositoryMatcherItem } from 'src/views/repository-matcher/types';

export const itemTypes = (item: RepositoryMatcherItem): string[] => {
  const t = (item as any).type;
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') return [t];
  return [];
};

export const buildItemUrl = (item: RepositoryMatcherItem): string => {
  const id = item._id || '';
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
  if (types.includes('Computational Tool Repository')) {
    const tab = getTabIdFromTypeLabel('ComputationalTool');
    if (tab) params.set('tab', tab);
  }
  return `/search?${params.toString()}`;
};
