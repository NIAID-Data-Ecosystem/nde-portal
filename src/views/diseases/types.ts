import { ThemingProps } from '@chakra-ui/react';
import { Params } from 'src/utils/api';

/**
 * Strapi structure
 * Use this interface to define the structure of the disease page data in the Strapi application
 *
 * title: Text; Required.
 * topic: Text; Required.
 * slug: UID; Required.
 * query: JSON; Required.
 * image: Media (single); Required.
 *
 * subtitle: Text; Optional.
 * description: Rich Text; Optional.
 * contacts: Component (existing component - repeatable - LinkItem); Optional.
 * externalLinks: Component (existing component - repeatable - LinkItem); Optional.
 *
 *
 */

export interface DiseasePageProps {
  id: number;
  title: string;
  topic: string;
  slug: string;
  query: Params;
  image: { url: string; alternativeText: string; caption?: string };
  subtitle: string | null;
  description: string | null;
  contacts: LinkItem[] | null;
  externalLinks: LinkItem[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface LinkItem {
  id: number;
  label: string;
  url: string;
  image: { url: string; alternativeText: string; caption?: string } | null;
  categories:
    | {
        id: number;
        name: string;
        description?: string;
        url?: string;
        createdAt: string;
        publishedAt: string;
        updatedAt: string;
      }[]
    | null;
  isExternal: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface TopicQueryProps {
  query: DiseasePageProps['query'];
  topic: string;
}

export interface FacetProps {
  label: string;
  value: string;
  fill: string;
  colorScheme: ThemingProps<any>['colorScheme'];
  tooltip: string;
}
