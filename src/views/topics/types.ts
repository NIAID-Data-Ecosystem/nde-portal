import { ThemingProps } from '@chakra-ui/react';

export interface TopicPageProps {
  id: number;
  attributes: {
    title: string;
    subtitle: string | null;
    description?: string | null;
    query: {
      q: string;
      facet_size: number;
      size: number;
    };
    slug: string | string[];
    topic: string;
    type: {
      data: {
        id: number;
        attributes: {
          name: string;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
        };
      }[];
    };
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
}

export interface TopicQueryProps {
  query: TopicPageProps['attributes']['query'];
  topic: string;
}

export interface FacetProps {
  label: string;
  value: string;
  fill: string;
  colorScheme: ThemingProps<any>['colorScheme'];
}
