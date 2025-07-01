export interface FeaturedPageProps {
  id: number;
  title: string;
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
}

export interface FeaturedQueryParams {
  status?: string;
  fields?: string[];
  populate?: {
    fields?: string[];
    thumbnail?: {
      fields?: string[];
    };
  };
  sort?: { publishedAt?: string; updatedAt?: string };
  paginate?: { page?: number; pageSize?: number };
}
