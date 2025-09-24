import { FeatureQueryResponse } from 'src/api/features/types';
import { UpdatesQueryResponse } from 'src/api/updates/types';

const MAX_SHORT_DESCRIPTION_LENGTH = 160;

export const transformFeaturedContentForCarousel = (
  data: FeatureQueryResponse[],
): UpdatesQueryResponse[] => {
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
