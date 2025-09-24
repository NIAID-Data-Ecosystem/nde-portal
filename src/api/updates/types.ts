import { MDXRemoteSerializeResult } from 'next-mdx-remote';

export interface UpdatesQueryParams {
  status?: string;
  fields?: string[];
  populate?:
    | {
        [key: string]: {
          fields: string[];
        };
      }
    | string;
  sort?: string;
  paginate?: { page?: number; pageSize?: number };
}

export interface BaseUpdateQueryResponse {
  id: number;
  subtitle: string | null;
  description: string | null;
  shortDescription: string | null;
  image:
    | null
    | { url: string; alternativeText: string }
    | { url: string; alternativeText: string }[];
  name: string | null;
  slug: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  categories:
    | {
        id: number;
        name: string;
        createdAt: string;
        publishedAt: string;
        updatedAt: string;
      }[]
    | null;
  compiledMDX?: MDXRemoteSerializeResult;
  mdx?: { [key: string]: MDXRemoteSerializeResult };
  type?: string;
  eventDate?: string;
}

export interface UpdatesQueryResponse {
  news: BaseUpdateQueryResponse[];
  events: BaseUpdateQueryResponse[];
  features: BaseUpdateQueryResponse[];
}
