import { FormattedResource } from 'src/utils/api/types';
import { Box, Flex, Link, Skeleton, Text } from 'nde-design-system';
import { shouldAppendPunctuation } from 'src/utils/helpers';
import { getCitationComponents } from './helpers';
import {
  MetadataTooltip,
  getMetadataDescription,
} from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';

interface ResourceCitationsProps {
  isLoading: boolean;
  citations?: FormattedResource['citation'];
  type?: FormattedResource['@type'];
}

const ResourceCitations = ({
  citations,
  isLoading,
  type,
}: ResourceCitationsProps) => {
  if (!citations) return <></>;

  return (
    <Skeleton isLoaded={!isLoading} mx={1} p={[0, 4]}>
      <Flex alignItems='baseline'>
        <Text
          fontSize='13px'
          fontWeight='medium'
          letterSpacing='wide'
          textTransform='uppercase'
          color='inherit'
          whiteSpace={['unset', 'nowrap']}
        >
          Citations {citations.length > 1 ? `(${citations.length})` : ''}
        </Text>
        <MetadataTooltip
          tooltipLabel={getMetadataDescription('citation', type)}
          property='citation'
        />
      </Flex>
      <ScrollContainer
        overflow='auto'
        maxHeight='200px'
        border='1px solid'
        borderColor='gray.100'
        borderRadius='semi'
        py={2}
      >
        {citations.map((citation, idx) => {
          const citationComponents = getCitationComponents(citation).map(
            component => {
              // If the component is an object (journal details), format it into a string
              if (component && typeof component === 'object') {
                const { key, name, volumeNumber, issueNumber, pagination } =
                  component;
                return (
                  <span key={key} style={{ fontStyle: 'italic' }}>
                    {shouldAppendPunctuation(
                      `${name}${volumeNumber ? `, ${volumeNumber}` : ''}${
                        issueNumber ? `(${issueNumber})` : ''
                      }${pagination ? `: ${pagination}` : ''}`,
                    )}
                  </span>
                );
              }
              if (component && typeof component === 'string') {
                return shouldAppendPunctuation(component);
              }
              return component;
            },
          );

          return (
            <Text
              key={idx}
              bg={idx % 2 ? 'tertiary.50' : 'transparent'}
              lineHeight='tall'
              fontSize='sm'
              px={4}
              py={2}
            >
              {citationComponents.map((component, index) => (
                <span key={index}>
                  {component}
                  {index < citationComponents.length - 1 ? ' ' : ''}
                </span>
              ))}
              <br />
              {citation.url && (
                <>
                  Available from:{' '}
                  <Link href={citation.url} isExternal>
                    {citation.url}
                  </Link>
                </>
              )}
            </Text>
          );
        })}
      </ScrollContainer>
    </Skeleton>
  );
};

export default ResourceCitations;
