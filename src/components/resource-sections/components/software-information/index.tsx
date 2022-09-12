import React from 'react';
import {
  Link,
  ListItem,
  Stack,
  Stat,
  StatLabel,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { Skeleton } from '@chakra-ui/skeleton';
import BasedOn from '../based-on';

interface SoftwareInformation {
  isLoading: boolean;
  discussionUrl?: FormattedResource['discussionUrl'];
  isBasedOn?: FormattedResource['isBasedOn'];
  isBasisFor?: FormattedResource['isBasisFor'];
  processorRequirements?: FormattedResource['processorRequirements'];
  programmingLanguage?: FormattedResource['programmingLanguage'];
  softwareAddOn?: FormattedResource['softwareAddOn'];
  softwareHelp?: FormattedResource['softwareHelp'];
  softwareRequirements?: FormattedResource['softwareRequirements'];
  softwareVersion?: FormattedResource['softwareVersion'];
  type?: FormattedResource['type'];
}

const SoftwareInformation: React.FC<SoftwareInformation> = ({
  isLoading,
  discussionUrl,
  isBasedOn,
  isBasisFor,
  processorRequirements,
  programmingLanguage,
  softwareAddOn,
  softwareHelp,
  softwareRequirements,
  softwareVersion,
  type,
}) => {
  return (
    <Skeleton isLoaded={!isLoading}>
      <Stack spacing={4} alignItems='flex-start'>
        {/* Language the code is written in */}
        {programmingLanguage && (
          <Stat>
            <StatLabel>Programming Language</StatLabel>
            <dd>
              <Text>{programmingLanguage.join(', ')}</Text>
            </dd>
          </Stat>
        )}

        {/* Requirements to run software */}
        {softwareVersion && (
          <Stat>
            <StatLabel>Software Version</StatLabel>
            <dd>
              <Text>{softwareVersion.join(', ')}</Text>
            </dd>
          </Stat>
        )}

        {processorRequirements && (
          <Stat>
            <StatLabel>Processor Requirements</StatLabel>
            <dd>
              <Text>{processorRequirements.join(', ')}</Text>
            </dd>
          </Stat>
        )}

        {/* Requirements to run software */}
        {softwareRequirements && (
          <Stat>
            <StatLabel>Software Requirements</StatLabel>
            <dd>
              <Text>{softwareRequirements.join(', ')}</Text>
            </dd>
          </Stat>
        )}

        {/* Provides enhancement to the list of tools */}
        {softwareAddOn && (
          <Stat>
            <StatLabel>Enhances</StatLabel>
            <dd>
              <UnorderedList ml={0}>
                {softwareAddOn.map(addOn => {
                  return (
                    <ListItem key={addOn.identifier}>
                      {addOn.identifier}
                    </ListItem>
                  );
                })}
              </UnorderedList>
            </dd>
          </Stat>
        )}

        {/* Tool imports. */}
        {isBasedOn && type !== 'Dataset' && (
          <Stat>
            <StatLabel>Imports</StatLabel>
            <dd>
              <BasedOn isLoading={isLoading} isBasedOn={isBasedOn}></BasedOn>
            </dd>
          </Stat>
        )}

        {/* Other tools which use this tool as import. */}
        {isBasisFor && (
          <Stat>
            <StatLabel>Dependency for</StatLabel>
            <dd>
              <BasedOn isLoading={isLoading} isBasedOn={isBasisFor}></BasedOn>
            </dd>
          </Stat>
        )}

        {/* Help / code examples*/}
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
                        {help?.name || help.url}
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
                        {url}
                      </Link>
                    </ListItem>
                  );
                })}
              </UnorderedList>
            </dd>
          </Stat>
        )}
      </Stack>
    </Skeleton>
  );
};

export default SoftwareInformation;
