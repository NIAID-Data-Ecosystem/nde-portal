import React from 'react';
import {
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { FaBitbucket, FaGithub } from 'react-icons/fa6';
import { FormattedResource } from 'src/utils/api/types';
import { HeadingWithTooltip } from './heading-with-tooltip';
import { Link } from 'src/components/link';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

interface AssociatedDocumentation {
  isLoading: boolean;
  type?: FormattedResource['@type'];
  mainEntityOfPage?: FormattedResource['mainEntityOfPage'];
  codeRepository?: FormattedResource['codeRepository'];
}

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

export const AssociatedDocumentation: React.FC<AssociatedDocumentation> = ({
  isLoading,
  codeRepository,
  mainEntityOfPage,
  type,
}) => {
  if (!isLoading && !(mainEntityOfPage || codeRepository || type)) {
    return <></>;
  }

  return (
    <>
      {/* mainEntityOfPage refers to a website for the resource. */}
      {mainEntityOfPage && (
        <Stack spacing={1}>
          <HeadingWithTooltip
            label='Associated Website'
            tooltipLabel={`${
              schema?.['mainEntityOfPage']?.description?.[type || 'Dataset'] ??
              ''
            }`}
          />
          {mainEntityOfPage &&
            (Array.isArray(mainEntityOfPage) ? (
              mainEntityOfPage.map(href => {
                return (
                  <Link
                    key={href}
                    href={href}
                    isExternal
                    wordBreak='break-word'
                    fontSize='xs'
                  >
                    {href}
                  </Link>
                );
              })
            ) : (
              <Link
                href={mainEntityOfPage}
                isExternal
                wordBreak='break-word'
                fontSize='xs'
              >
                {mainEntityOfPage}
              </Link>
            ))}
        </Stack>
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
            label='Code Repository'
            tooltipLabel={`${
              schema?.['coreRepository']?.description?.[type || 'Dataset'] ?? ''
            }`}
          />
          <UnorderedList alignItems='center' ml={0}>
            {(Array.isArray(codeRepository)
              ? codeRepository
              : [codeRepository]
            ).map((repo, idx) => {
              return (
                <ListItem key={idx} alignItems='start' display='flex' pb={2}>
                  <Box mx={1} mt={1}>
                    {repo.includes('git') && <Icon as={FaGithub} boxSize={4} />}
                    {repo.includes('bitbucket') && (
                      <Icon as={FaBitbucket} boxSize={4} />
                    )}
                  </Box>
                  {repo.includes('http') ? (
                    <Link href={repo} isExternal wordBreak='break-word' ml={1}>
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
