import React from 'react';
import {
  Circle,
  FormControl,
  FormLabel,
  Icon,
  Stack,
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
      <FormControl display='flex' alignItems='center'>
        <Tooltip
          bg='white'
          isDisabled={isDisabled}
          label={
            <Stack color='text.body' lineHeight='shorter' p={1}>
              <Text color='inherit'>
                Ranks results based on the presence of unique fields.
              </Text>
              <Text color='inherit'>
                First scores by query, then refines rankings with an additional
                function score.
              </Text>
              <Text color='inherit'>
                Adjusts results based on a calculated metadata score.
              </Text>
            </Stack>
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
