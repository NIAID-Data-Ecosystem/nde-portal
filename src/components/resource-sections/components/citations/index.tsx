import { FormattedResource } from 'src/utils/api/types';
import { Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { shouldAppendPunctuation } from 'src/utils/helpers/authors';
import { getCitationComponents } from './helpers';

interface ResourceCitationsProps {
  citations?: FormattedResource['citation'];
}

const ResourceCitations = ({ citations }: ResourceCitationsProps) => {
  if (!citations) return <></>;

  return (
    <>
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
            bg={idx % 2 ? 'niaid.50' : 'transparent'}
            lineHeight='tall'
            fontSize='inherit'
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
            {citation.abstract && (
              <>
                <strong>Abstract:</strong> {citation.abstract}
                <br />
              </>
            )}
            {citation.description && (
              <>
                <strong>Description:</strong> {citation.description}
                <br />
              </>
            )}
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
    </>
  );
};

export default ResourceCitations;
