import { FeatureQueryResponse } from 'src/api/features/types';
import { BaseUpdateQueryResponse } from 'src/api/updates/types';

export const formatImage = (image?: BaseUpdateQueryResponse['image']) => {
  const DEFAULT = {
    src: '/assets/news-thumbnail.png',
    alt: 'Carousel Card Thumbnail Image',
  };
  if (!image) {
    return DEFAULT;
  }

  if (Array.isArray(image)) {
    return {
      src: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image[0].url}`,
      alt: image[0].alternativeText || DEFAULT.alt,
    };
  }

  return {
    src: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.url}`,
    alt: image.alternativeText || DEFAULT.alt,
  };
};

const MAX_SHORT_DESCRIPTION_LENGTH = 160;

export const transformFeaturedContentForCarousel = (
  data: FeatureQueryResponse[],
): BaseUpdateQueryResponse[] => {
  if (!data) return [];
  return data.map(item => {
    return {
      ...item,
      name: item.title,
      type: 'feature',
      description: item.content,
      shortDescription:
        item?.abstract?.slice(0, MAX_SHORT_DESCRIPTION_LENGTH) || '',
      image: item.thumbnail,
    };
  });
};
