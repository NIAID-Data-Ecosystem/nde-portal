import { ThemingProps } from '@chakra-ui/react';
import { Params } from 'src/utils/api';

/**
 * Strapi API response types for Disease content
 */

export interface DiseaseImageApiResponse {
  id: number;
  url: string;
  alternativeText: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DiseaseLinkItemApiResponse {
  id: number;
  label: string;
  url: string;
  image: DiseaseImageApiResponse | null;
  categories: DiseaseCategoryApiResponse[] | null;
  isExternal: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface DiseaseCategoryApiResponse {
  id: number;
  name: string;
  description?: string;
  url?: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
}

export interface DiseaseApiResponse {
  id: number;
  title: string;
  topic: string;
  slug: string;
  query: Params;
  image: DiseaseImageApiResponse;
  subtitle?: string;
  description?: string;
  contacts?: DiseaseLinkItemApiResponse[];
  externalLinks?: DiseaseLinkItemApiResponse[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface DiseaseCollectionApiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface DiseaseSingleApiResponse<T> {
  data: T;
  meta: {};
}

/**
 * Application domain types (aligned with API response)
 */

export interface LinkItem {
  id: number;
  label: string;
  url: string;
  image: DiseaseImageApiResponse | null;
  categories: DiseaseCategoryApiResponse[] | null;
  isExternal: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface DiseasePageProps {
  id: number;
  title: string;
  topic: string;
  slug: string;
  query: Params;
  image: DiseaseImageApiResponse;
  subtitle?: string;
  description?: string;
  contacts?: LinkItem[];
  externalLinks?: LinkItem[];
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
