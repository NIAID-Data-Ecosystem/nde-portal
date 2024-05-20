import { TopicBrowser } from 'src/components/topic-brower';
import { ZoomContainer } from 'src/components/topic-brower/components/zoom-container';
import { transformPathArraysToTree } from 'src/components/topic-brower/helpers';
import { useEDAMPaths2Root } from 'src/components/topic-brower/hooks';
import { FormattedResource } from 'src/utils/api/types';
import { ParentSize } from '@visx/responsive';

interface TopicDisplayProps {
  topics: FormattedResource['topicCategory'];
}

export const TopicDisplay = ({ topics }: TopicDisplayProps) => {
  const { data } = useEDAMPaths2Root(topics);
  const tree = data && transformPathArraysToTree(data.flat());
  return (
    <div>
      <ParentSize>
        {parent => {
          return (
            <ZoomContainer width={parent.width} height={parent.width * 0.52}>
              <TopicBrowser
                data={tree}
                width={parent.width}
                height={parent.width * 0.52}
              />
            </ZoomContainer>
          );
        }}
      </ParentSize>
    </div>
  );
};
