import React from 'react';
import {
  Flex,
  Link,
  ListItem,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { Skeleton } from '@chakra-ui/skeleton';
import BasedOn from '../based-on';
import {
  FaArrowAltCircleUp,
  FaCheckCircle,
  FaFileExport,
  FaFileImport,
  FaSitemap,
} from 'react-icons/fa';
import InputOutput from './components/input-output';

interface SoftwareInformation {
  isLoading: boolean;
  keys?: (keyof FormattedResource)[];
  applicationCategory?: FormattedResource['applicationCategory'];
  discussionUrl?: FormattedResource['discussionUrl'];
  input?: FormattedResource['input'];
  isBasedOn?: FormattedResource['isBasedOn'];
  isBasisFor?: FormattedResource['isBasisFor'];
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
  isLoading,
  keys,
  ...props
}) => {
  const {
    applicationCategory,
    discussionUrl,
    input,
    isBasedOn,
    isBasisFor,
    output,
    processorRequirements,
    programmingLanguage,
    softwareAddOn,
    softwareHelp,
    softwareRequirements,
    softwareVersion,
  } = props || {};

  const StatText: React.FC = ({ children }) => {
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
    <Skeleton isLoaded={!isLoading}>
      <Stack alignItems='flex-start'>
        <SimpleGrid
          spacing={6}
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
            <Stat>
              <StatLabel>Programming Language</StatLabel>
              <dd>
                <StatText>{programmingLanguage.join(', ')}</StatText>
              </dd>
            </Stat>
          )}

          {applicationCategory && (
            <Stat>
              <StatLabel>Software Category</StatLabel>
              <dd>
                <StatText>{applicationCategory.join(', ')}</StatText>
              </dd>
            </Stat>
          )}

          {/* Software Version */}
          {softwareVersion && (
            <Stat>
              <StatLabel>Software Version</StatLabel>
              <dd>
                <StatText>{softwareVersion.join(', ')}</StatText>
              </dd>
            </Stat>
          )}

          {/* Processor requirements to run software */}
          {processorRequirements && (
            <Stat>
              <StatLabel>Processor Requirements</StatLabel>
              <dd>
                <StatText>{processorRequirements.join(', ')}</StatText>
              </dd>
            </Stat>
          )}

          {/* Software requirements to run software */}
          {softwareRequirements && (
            <Stat>
              <StatLabel>Software Requirements</StatLabel>
              <dd>
                <BasedOn
                  isLoading={isLoading}
                  isBasedOn={softwareRequirements.map(identifier => ({
                    identifier,
                  }))}
                  icon={FaCheckCircle}
                />
              </dd>
            </Stat>
          )}
          {/* Help / code examples or contact.*/}
          {softwareHelp && softwareHelp.filter(h => h.url).length > 0 && (
            <Stat>
              <StatLabel>Software Help</StatLabel>
              <dd>
                <UnorderedList ml={0}>
                  {softwareHelp.map(help => {
                    if (!help.url) {
                      return <></>;
                    }
                    return (
                      <ListItem key={help.url}>
                        <Link href={help.url} isExternal>
                          <StatText>{help?.name || help.url}</StatText>
                        </Link>
                      </ListItem>
                    );
                  })}
                </UnorderedList>
              </dd>
            </Stat>
          )}

          {/* Software discussion, seems to be mostly github issues */}
          {discussionUrl && (
            <Stat>
              <StatLabel>Discussion and Issues</StatLabel>
              <dd>
                <UnorderedList ml={0}>
                  {discussionUrl.map(url => {
                    return (
                      <ListItem key={url}>
                        <Link href={url} isExternal>
                          <StatText>{url}</StatText>
                        </Link>
                      </ListItem>
                    );
                  })}
                </UnorderedList>
              </dd>
            </Stat>
          )}

          {/* Provides enhancement to the list of tools */}
          {softwareAddOn && (
            <Stat>
              <StatLabel>Enhances</StatLabel>
              <dd>
                <BasedOn
                  isLoading={isLoading}
                  isBasedOn={softwareAddOn}
                  icon={FaArrowAltCircleUp}
                />
              </dd>
            </Stat>
          )}

          {/* Libraries that the tool imports. */}
          {isBasedOn && (
            <Stat w='100%'>
              <StatLabel>Imports</StatLabel>
              <dd>
                <BasedOn
                  isLoading={isLoading}
                  isBasedOn={isBasedOn}
                  icon={FaFileImport}
                />
              </dd>
            </Stat>
          )}

          {/* Other tools which use this tool as import. */}
          {isBasisFor && (
            <Stat>
              <StatLabel>Dependency for</StatLabel>
              <dd>
                <BasedOn
                  isLoading={isLoading}
                  isBasedOn={isBasisFor}
                  icon={FaSitemap}
                />
              </dd>
            </Stat>
          )}

          {/* Software input such as file or parameter. */}
          <Stack direction={['column', 'row']}>
            {input && (
              <Stat>
                <StatLabel>Tool inputs</StatLabel>
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
              </Stat>
            )}
            {/* Software output of a tool. */}
            {output && (
              <Stat>
                <StatLabel>Tool outputs</StatLabel>
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
              </Stat>
            )}
          </Stack>
        </SimpleGrid>
      </Stack>
    </Skeleton>
  );
};

export default SoftwareInformation;
