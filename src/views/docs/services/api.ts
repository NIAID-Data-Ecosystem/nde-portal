import axios from 'axios';
import type { DocumentationProps, DocumentationByCategories } from '../types';

const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const status = isProd ? 'published' : 'draft';

// Fetch all documentation categories with their associated documents
export const fetchCategories = async (): Promise<
  DocumentationByCategories[]
> => {
  try {
    const { data } = await axios.get(
      `${baseUrl}/api/categories?filters[docs][name][$null]&populate[docs][fields][0]=name&populate[docs][fields][1]=slug&populate[docs][fields][2]=description&populate[docs][sort][1]=order:asc&pagination[page]=1&pagination[pageSize]=100&sort[0]=order:asc&status=${status}`,
    );
    return data.data;
  } catch (err: any) {
    throw err.response;
  }
};

// Fetch a specific documentation page by slug
export const fetchDocumentation = async (
  slug: string | string[],
): Promise<DocumentationProps[]> => {
  try {
    const { data } = await axios.get(
      `${baseUrl}/api/docs?populate=*&filters[$and][0][slug][$eqi]=${slug}&status=${status}`,
    );
    return data.data;
  } catch (err: any) {
    throw err.response;
  }
};

// Search documentation by term
export const searchDocumentation = async (
  searchTerm: string,
): Promise<DocumentationProps[]> => {
  try {
    const { data } = await axios.get(
      `${baseUrl}/api/docs?populate[fields][0]=name&populate[fields][1]=slug&populate[fields][2]=publishedAt&populate[fields][3]=updatedAt&populate[fields][4]=subtitle&populate[fields][5]=description&sort[publishedAt]=desc&sort[updatedAt]=desc&paginate[page]=1&paginate[pageSize]=5&status=${status}&_q=${searchTerm}`,
    );
    return data.data;
  } catch (err: any) {
    throw err.response;
  }
};

// Fetch all documentation slugs for static path generation
export const fetchAllDocumentationSlugs = async (): Promise<
  Array<{ id: number; documentId: string; slug: string }>
> => {
  try {
    const { data } = await axios.get(
      `${baseUrl}/api/docs?fields[0]=slug&status=${status}`,
    );
    return data.data;
  } catch (err: any) {
    throw err;
  }
};
