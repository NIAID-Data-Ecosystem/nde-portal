import React from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';
import MetadataConfig from 'configs/resource-metadata.json';
import { HeadingWithTooltip } from './heading-with-tooltip';
import { DisplayHTMLContent } from 'src/components/html-content';
import { Link } from 'src/components/link';

interface AssociatedDocumentation {
  isLoading: boolean;
  hasPart?: FormattedResource['hasPart'];
  mainEntityOfPage?: FormattedResource['mainEntityOfPage'];
  codeRepository?: FormattedResource['codeRepository'];
}

export const AssociatedDocumentation: React.FC<AssociatedDocumentation> = ({
  isLoading,
  codeRepository,
  hasPart,
  mainEntityOfPage,
}) => {
  if (!isLoading && !(hasPart || mainEntityOfPage || codeRepository)) {
    return <></>;
  }
  return (
    <>
      {hasPart && (
        <Box>
          <HeadingWithTooltip
            label='Associated Documents'
            tooltipLabel={`${
              MetadataConfig?.find(d => d.property === 'hasPart')?.description[
                'dataset'
              ] || ''
            }`}
          />
          <Flex flexDirection='column'>
            {hasPart &&
              hasPart.map((part, idx) => {
                if (!part.name && !part.url)
                  return <React.Fragment key={idx} />;
                if (part.url) {
                  return (
                    <Link
                      key={part.url}
                      href={part.url}
                      isExternal
                      wordBreak='break-word'
                      fontSize='inherit'
                      mb={1}
                    >
                      {part?.name || part.url}
                    </Link>
                  );
                }
                return (
                  part?.name && (
                    <Box key={part.name} sx={{ h4: { fontWeight: 'medium' } }}>
                      <DisplayHTMLContent
                        key={part.name}
                        wordBreak='break-word'
                        content={part.name}
                        fontSize='inherit'
                      />
                    </Box>
                  )
                );
              })}
          </Flex>
        </Box>
      )}
      {/* mainEntityOfPage refers to a website for the resource. */}
      {mainEntityOfPage && (
        <Box>
          <HeadingWithTooltip
            label='Associated Website'
            tooltipLabel={`${
              MetadataConfig?.find(d => d.property === 'mainEntityOfPage')
                ?.description['dataset'] || ''
            }`}
          />
          {mainEntityOfPage && (
            <Link
              href={mainEntityOfPage}
              isExternal
              wordBreak='break-word'
              fontSize='xs'
            >
              {mainEntityOfPage}
            </Link>
          )}
        </Box>
      )}

      {/* Links to the source code of the tool  */}
      {codeRepository && (
        <Flex
          flexDirection='column'
          alignItems='flex-start'
          flexWrap='wrap'
          minW='200px'
          maxW='350px'
          flex={1}
        >
          <HeadingWithTooltip
            label='Associated Source Code'
            tooltipLabel={`${
              MetadataConfig?.find(d => d.property === 'codeRepository')
                ?.description['computationaltool'] || ''
            }`}
          />
          <UnorderedList alignItems='center' ml={0}>
            {(Array.isArray(codeRepository)
              ? codeRepository
              : [codeRepository]
            ).map((repo, idx) => {
              return (
                <ListItem key={idx} alignItems='center'>
                  {repo.includes('git') && (
                    <Icon as={FaGithub} mx={1} boxSize={4} />
                  )}
                  {repo.includes('http') ? (
                    <Link href={repo} isExternal wordBreak='break-word' mx={2}>
                      {repo.includes('git') ? 'View code on Github' : repo}
                    </Link>
                  ) : (
                    <Text>{repo}</Text>
                  )}
                </ListItem>
              );
            })}
          </UnorderedList>
        </Flex>
      )}
    </>
  );
};
