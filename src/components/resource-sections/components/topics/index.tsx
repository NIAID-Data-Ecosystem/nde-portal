import { TopicBrowser } from 'src/components/topic-brower';
import {
  ZoomContainer,
  ZoomProps,
} from 'src/components/topic-brower/components/zoom-container';
import { transformPathArraysToTree } from 'src/components/topic-brower/helpers';
import { useEDAMPaths2Root } from 'src/components/topic-brower/hooks';
import { FormattedResource } from 'src/utils/api/types';
import { ParentSize } from '@visx/responsive';

interface TopicDisplayProps {
  topics: FormattedResource['topicCategory'];
  initialZoom?: ZoomProps['initialTransform'];
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const TopicDisplay = ({
  topics,
  initialZoom,
  margin,
}: TopicDisplayProps) => {
  const { data } = useEDAMPaths2Root(topics);
  const tree = data && transformPathArraysToTree(data.flat());
  return (
    <>
      <ParentSize>
        {parent => {
          return (
            <ZoomContainer
              width={parent.width}
              height={parent.width * 0.52}
              bg='#272b4d'
              initialTransform={initialZoom}
            >
              <TopicBrowser
                data={tree}
                width={parent.width}
                height={parent.width * 0.52}
                margin={margin}
              />
            </ZoomContainer>
          );
        }}
      </ParentSize>
    </>
  );
};
