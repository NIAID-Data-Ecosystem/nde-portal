import React from 'react';
import {
  Box,
  Circle,
  FormControl,
  FormLabel,
  Icon,
  Switch,
  Text,
} from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { FaInfo } from 'react-icons/fa6';

export const MetadataScoreToggle = React.memo(
  ({
    isChecked,
    isDisabled,
    handleToggle,
  }: {
    isChecked: boolean;
    isDisabled: boolean;
    handleToggle: () => void;
  }) => {
    return (
      <FormControl display='flex' alignItems='center' mx={1} my={2}>
        <Tooltip
          bg='white'
          isDisabled={isDisabled}
          label={
            <Box color='text.body' lineHeight='shorter' p={1}>
              <Text color='inherit' pb={1.5}>
                Ranks results based on the presence of unique fields.
              </Text>
              <Text color='inherit' pb={1.5}>
                First scores by query, then refines rankings with an additional
                function score.
              </Text>
              <Text color='inherit' pb={1.5}>
                Adjusts results based on a calculated metadata score.
              </Text>
            </Box>
          }
          hasArrow
          gutter={2}
        >
          <FormLabel
            htmlFor='metadata-score-toggle'
            mb='0'
            mr={2}
            display='flex'
            alignItems='start'
            opacity={isDisabled ? 0.4 : 1}
            fontWeight='normal'
            fontSize='sm'
          >
            Use Metadata Score?
            <Circle
              size={4}
              borderColor='gray.600'
              borderWidth='1px'
              color='gray.600'
              ml={1}
            >
              <Icon as={FaInfo} boxSize={2} />
            </Circle>
          </FormLabel>
        </Tooltip>
        <Switch
          id='metadata-score-toggle'
          isChecked={isChecked}
          onChange={handleToggle}
          colorScheme='secondary'
          isDisabled={isDisabled}
        />
      </FormControl>
    );
  },
);
