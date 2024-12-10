import React from 'react';
import { Flex, FlexProps, Icon, Text } from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { TagWithUrl } from 'src/components/tag-with-url';
import Tooltip from 'src/components/tooltip';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { FaInfo } from 'react-icons/fa6';

interface ProgrammingLanguageProps extends FlexProps {
  data: string[];
}

const metadataFields = SCHEMA_DEFINITIONS as SchemaDefinitions;

const ProgrammingLanguages: React.FC<ProgrammingLanguageProps> = ({
  data,
  ...props
}) => {
  const cleanedAndSortedLanguages = (data ?? [])
    .filter(element => element != null)
    .sort();

  if (cleanedAndSortedLanguages.length === 0) return null;
  return (
    <Flex
      flexWrap='wrap'
      my={0}
      py={1}
      borderBottom='1px solid'
      borderBottomColor='gray.200'
      {...props}
    >
      <Tooltip
        label={
          metadataFields['programmingLanguage'].description?.[
            'ComputationalTool'
          ]
        }
      >
        <Text fontSize='xs' color='gray.800' mr={1} userSelect='none'>
          Programming Languages
          <Icon
            as={FaInfo}
            boxSize={3.5}
            border='1px solid'
            borderRadius='full'
            p={0.5}
            mx={1}
            color='gray.800!important'
          />
          :
        </Text>
      </Tooltip>

      {cleanedAndSortedLanguages?.map(element => {
        return (
          <TagWithUrl
            key={element}
            colorScheme='primary'
            href={{
              pathname: '/search',
              query: {
                q: `programmingLanguage:"${element.trim()}"`,
              },
            }}
            m={0.5}
            leftIcon={FaMagnifyingGlass}
          >
            {element}
          </TagWithUrl>
        );
      })}
    </Flex>
  );
};

export default ProgrammingLanguages;