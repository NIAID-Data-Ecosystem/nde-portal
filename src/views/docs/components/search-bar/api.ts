import axios from 'axios';

export const searchDocumentation = async (searchTerm: string) => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const docs = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/docs?populate[fields][0]=name&populate[fields][1]=slug&populate[fields][2]=publishedAt&populate[fields][3]=updatedAt&populate[fields][4]=subtitle&populate[fields][5]=description&sort[publishedAt]=desc&sort[updatedAt]=desc&paginate[page]=1&paginate[pageSize]=5&status=${
        isProd ? 'published' : 'draft'
      }&_q=${searchTerm}`,
    );
    return docs.data.data;
  } catch (err: any) {
    throw err.response;
  }
};
