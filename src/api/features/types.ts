import { UpdatesQueryParams } from '../updates/types';

export interface FeatureQueryParams extends UpdatesQueryParams {}

export interface MetaFields {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface FeatureQueryResponse {
  id: number;
  title: string;
  abstract: string;
  content: string;
  subtitle: string;
  banner: { url: string; alternativeText: string } | null;
  thumbnail: { url: string; alternativeText: string } | null;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
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
  // Meta fields for SEO
  metaFields?: MetaFields;
}
