import React from 'react';
import {
  Flex,
  SimpleGrid,
  Skeleton,
  Stack,
  Stat,
  Text,
  List,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';
import { FaFileExport, FaFileImport } from 'react-icons/fa6';
import InputOutput from './components/input-output';

interface SoftwareInformation {
  loading: boolean;
  keys?: (keyof FormattedResource)[];
  applicationCategory?: FormattedResource['applicationCategory'];
  discussionUrl?: FormattedResource['discussionUrl'];
  input?: FormattedResource['input'];
  output?: FormattedResource['output'];
  processorRequirements?: FormattedResource['processorRequirements'];
  programmingLanguage?: FormattedResource['programmingLanguage'];
  softwareAddOn?: FormattedResource['softwareAddOn'];
  softwareHelp?: FormattedResource['softwareHelp'];
  softwareRequirements?: FormattedResource['softwareRequirements'];
  softwareVersion?: FormattedResource['softwareVersion'];
  type?: FormattedResource['type'];
  [key: string]: any;
}

const SoftwareInformation: React.FC<SoftwareInformation> = ({
  loading,
  keys,
  ...props
}) => {
  const {
    applicationCategory,
    discussionUrl,
    input,
    output,
    processorRequirements,
    programmingLanguage,
    softwareHelp,
    softwareVersion,
  } = props || {};

  const StatText: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <Text fontSize='sm' lineHeight='short'>
        {children}
      </Text>
    );
  };

  // where [isLongList]=true if the length of the items within a category exceeds 5.
  const isLongList =
    props &&
    Object.keys(props)
      .map(propertyKey => {
        const value = props[propertyKey];
        if (Array.isArray(value) && value.length > 5) {
          return true;
        }
        return false;
      })
      .findIndex(d => d === true) >= 0;
  // Number of fields that have a value in this section. Used for layout.
  const properties = keys?.filter(key => props[key] !== null) || [];
  return (
    <Skeleton loading={!!loading}>
      <Stack alignItems='flex-start'>
        <SimpleGrid
          gap={6}
          w='100%'
          gridTemplateColumns={{
            base: 'repeat(1, minmax(0, 1fr))',
            sm: `repeat(auto-fill, minmax(min(100%/2, max(${
              isLongList ? '100%' : '250px'
            }, 100%/${Math.min(properties.length, 4)})),1fr))`,
          }}
        >
          {/* Language the code is written in */}
          {programmingLanguage && (
            <Stat.Root>
              <Stat.Label>Programming Language</Stat.Label>
              <dd>
                <StatText>{programmingLanguage.join(', ')}</StatText>
              </dd>
            </Stat.Root>
          )}

          {applicationCategory && (
            <Stat.Root>
              <Stat.Label>Software Category</Stat.Label>
              <dd>
                <StatText>{applicationCategory.join(', ')}</StatText>
              </dd>
            </Stat.Root>
          )}

          {/* Software Version */}
          {softwareVersion && (
            <Stat.Root>
              <Stat.Label>Software Version</Stat.Label>
              <dd>
                <StatText>{softwareVersion.join(', ')}</StatText>
              </dd>
            </Stat.Root>
          )}

          {/* Processor requirements to run software */}
          {processorRequirements && (
            <Stat.Root>
              <Stat.Label>Processor Requirements</Stat.Label>
              <dd>
                <StatText>{processorRequirements.join(', ')}</StatText>
              </dd>
            </Stat.Root>
          )}

          {/* Help / code examples or contact.*/}
          {softwareHelp && softwareHelp.filter(h => h.url).length > 0 && (
            <Stat.Root>
              <Stat.Label>Software Help</Stat.Label>
              <dd>
                <List.Root as='ul' ml={0}>
                  {softwareHelp.map(help => {
                    if (!help.url) {
                      return <></>;
                    }
                    return (
                      <List.Item key={help.url}>
                        <Link href={help.url} isExternal>
                          <StatText>{help?.name || help.url}</StatText>
                        </Link>
                      </List.Item>
                    );
                  })}
                </List.Root>
              </dd>
            </Stat.Root>
          )}

          {/* Software discussion, seems to be mostly github issues */}
          {discussionUrl && (
            <Stat.Root>
              <Stat.Label>Discussion and Issues</Stat.Label>
              <dd>
                <List.Root as='ul' ml={0}>
                  {discussionUrl.map(url => {
                    return (
                      <List.Item key={url}>
                        <Link href={url} isExternal>
                          <StatText>{url}</StatText>
                        </Link>
                      </List.Item>
                    );
                  })}
                </List.Root>
              </dd>
            </Stat.Root>
          )}

          {/* Software input such as file or parameter. */}
          <Stack direction={['column', 'row']}>
            {input && (
              <Stat.Root>
                <Stat.Label>Tool inputs</Stat.Label>
                <Flex maxH='400px' overflowY='auto' w='100%' pr={4}>
                  <dd>
                    {input.map((data, i) => {
                      return (
                        <InputOutput
                          key={i}
                          icon={FaFileImport}
                          {...data}
                        ></InputOutput>
                      );
                    })}
                  </dd>
                </Flex>
              </Stat.Root>
            )}
            {/* Software output of a tool. */}
            {output && (
              <Stat.Root>
                <Stat.Label>Tool outputs</Stat.Label>
                <Flex maxH='400px' overflowY='auto' w='100%' pr={4}>
                  <dd>
                    {output.map((data, i) => {
                      return (
                        <InputOutput
                          key={i}
                          icon={FaFileExport}
                          {...data}
                        ></InputOutput>
                      );
                    })}
                  </dd>
                </Flex>
              </Stat.Root>
            )}
          </Stack>
        </SimpleGrid>
      </Stack>
    </Skeleton>
  );
};

export default SoftwareInformation;
