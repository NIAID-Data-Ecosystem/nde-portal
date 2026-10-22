import { Box, Flex, Icon, List, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React from 'react';
import { FaBitbucket, FaGithub } from 'react-icons/fa6';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';

import { HeadingWithTooltip } from './heading-with-tooltip';

interface AssociatedDocumentation {
  loading: boolean;
  type?: FormattedResource['@type'];
  mainEntityOfPage?: FormattedResource['mainEntityOfPage'];
  codeRepository?: FormattedResource['codeRepository'];
}

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

export const AssociatedDocumentation: React.FC<AssociatedDocumentation> = ({
  loading,
  codeRepository,
  mainEntityOfPage,
  type,
}) => {
  if (!loading && !(mainEntityOfPage || codeRepository || type)) {
    return <></>;
  }

  return (
    <>
      {/* mainEntityOfPage refers to a website for the resource. */}
      {mainEntityOfPage && (
        <Stack gap={1}>
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
                  >
                    {href}
                  </Link>
                );
              })
            ) : (
              <Link href={mainEntityOfPage} isExternal wordBreak='break-word'>
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
          <List.Root as='ul' alignItems='center' ml={0}>
            {(Array.isArray(codeRepository)
              ? codeRepository
              : [codeRepository]
            ).map((repo, idx) => {
              return (
                <List.Item key={idx} alignItems='start' display='flex' pb={2}>
                  <Box mx={1} mt={1}>
                    {repo.includes('git') && (
                      <Icon boxSize={4}>
                        <FaGithub />
                      </Icon>
                    )}
                    {repo.includes('bitbucket') && (
                      <Icon boxSize={4}>
                        <FaBitbucket />
                      </Icon>
                    )}
                  </Box>
                  {repo.includes('http') ? (
                    <Link href={repo} isExternal wordBreak='break-word' ml={1}>
                      {repo.includes('git') ? 'View code on Github' : repo}
                    </Link>
                  ) : (
                    <Text>{repo}</Text>
                  )}
                </List.Item>
              );
            })}
          </List.Root>
        </Flex>
      )}
    </>
  );
};
