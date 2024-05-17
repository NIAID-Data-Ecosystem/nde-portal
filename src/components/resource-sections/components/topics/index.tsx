import { TopicBrowser } from 'src/components/topic-brower';
import { transformPathArraysToTree } from 'src/components/topic-brower/helpers';
import { useEDAMPaths2Root } from 'src/components/topic-brower/hooks';
import { FormattedResource } from 'src/utils/api/types';

interface TopicDisplayProps {
  topics: FormattedResource['topicCategory'];
}

export const TopicDisplay = ({ topics }: TopicDisplayProps) => {
  const { data } = useEDAMPaths2Root(topics);
  const tree = data && transformPathArraysToTree(data.flat());
  return <TopicBrowser data={tree} />;
};
