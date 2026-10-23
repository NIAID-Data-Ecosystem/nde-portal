import { Box, Flex, Icon, List, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React from 'react';
import { FaBitbucket, FaGithub } from 'react-icons/fa6';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { InfoLabel } from 'src/components/info-label';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';

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
  const isGithubRepo = (repo: string) => repo.includes('git');
  const isBitbucketRepo = (repo: string) => repo.includes('bitbucket');
  return (
    <>
      {/* mainEntityOfPage refers to a website for the resource. */}
      {mainEntityOfPage && (
        <Stack gap={1}>
          <InfoLabel
            label='Associated Website'
            tooltipProps={{
              content:
                schema?.['mainEntityOfPage']?.description?.[
                  type || 'Dataset'
                ] ?? '',
            }}
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
          <InfoLabel
            label='Code Repository'
            tooltipProps={{
              content:
                schema?.['codeRepository']?.description?.[type || 'Dataset'] ??
                '',
            }}
          />
          <List.Root as='ul' alignItems='center' pl={0}>
            {(Array.isArray(codeRepository)
              ? codeRepository
              : [codeRepository]
            ).map((repo, idx) => {
              return (
                <List.Item
                  key={idx}
                  alignItems='start'
                  display='flex'
                  pb={2}
                  listStyle='none'
                  gap={1}
                >
                  {(isGithubRepo(repo) || isBitbucketRepo(repo)) && (
                    <Icon boxSize={4} mt={1}>
                      {isGithubRepo(repo) && <FaGithub />}
                      {isBitbucketRepo(repo) && <FaBitbucket />}
                    </Icon>
                  )}

                  {repo.includes('http') ? (
                    <Link href={repo} isExternal wordBreak='break-word'>
                      {isGithubRepo(repo) ? 'View code on Github' : repo}
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
