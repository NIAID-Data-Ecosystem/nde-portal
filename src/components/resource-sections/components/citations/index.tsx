import { FormattedResource } from 'src/utils/api/types';
import { Flex, Link, Skeleton, Text } from 'nde-design-system';
import { shouldAppendPunctuation } from 'src/utils/helpers';
import { getCitationComponents } from './helpers';
import {
  MetadataLabel,
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
    <Skeleton isLoaded={!isLoading} mx={1} py={2}>
      <Flex alignItems='baseline' lineHeight='short' mb={1}>
        <MetadataLabel
          label={`Citation${
            citations.length > 1 ? `s (${citations.length})` : ''
          }`}
        />
        <MetadataTooltip
          tooltipLabel={getMetadataDescription('citation', type)}
        />
      </Flex>
      <ScrollContainer
        overflow='auto'
        maxHeight='200px'
        border='1px solid'
        borderColor='gray.100'
        borderRadius='semi'
        my={2}
        py={2}
      >
        {citations.map((citation, idx) => {
          const citationComponents = getCitationComponents(citation)
            .map(component => {
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
            })
            .filter(Boolean);
          return (
            <Text
              key={idx}
              bg={idx % 2 ? 'tertiary.50' : 'transparent'}
              lineHeight='tall'
              fontSize='sm'
              px={2}
              py={citations.length > 1 ? 2 : 0}
            >
              {citationComponents?.map((component, index) => (
                <span key={index}>
                  {component}
                  {index < citationComponents.length - 1 ? ' ' : ''}
                </span>
              ))}
              {citationComponents.length > 0 && <br />}
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
