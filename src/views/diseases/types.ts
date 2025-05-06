import { ThemingProps } from '@chakra-ui/react';
import { Params } from 'src/utils/api';

export interface DiseasePageProps {
  id: number;
  attributes: {
    title: string;
    subtitle: string | null;
    description?: string | null;
    image: {
      data: null | {
        attributes: { url: string; alternativeText: string; caption?: string };
      };
    };
    contactLinks?: {
      data: {
        id: number;
        attributes: {
          label: string;
          url: string;
          categories: {
            data: {
              id: number;
              attributes: {
                name: string;
                createdAt: string;
                publishedAt: string;
                updatedAt: string;
              };
            }[];
          } | null;
          isExternal: boolean;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
        };
      }[];
    } | null;
    externalLinks?: {
      data: {
        id: number;
        attributes: {
          label: string;
          image: {
            data: null | {
              attributes: { url: string; alternativeText: string };
            };
          };
          url: string;
          categories: {
            data: {
              id: number;
              attributes: {
                name: string;
                createdAt: string;
                publishedAt: string;
                updatedAt: string;
              };
            }[];
          } | null;
          isExternal: boolean;
          createdAt: string;
          updatedAt: string;
          publishedAt: string;
        };
      }[];
    } | null;
    query: Params;
    slug: string;
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
  query: DiseasePageProps['attributes']['query'];
  topic: string;
}

export interface FacetProps {
  label: string;
  value: string;
  fill: string;
  colorScheme: ThemingProps<any>['colorScheme'];
}
