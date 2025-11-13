import { Circle, Flex, Icon, Span, Stack, Switch } from '@chakra-ui/react';
import React from 'react';
import { FaInfo } from 'react-icons/fa6';
import { Tooltip } from 'src/components/tooltip';

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
      <Flex w='100%'>
        <Tooltip
          disabled={isDisabled}
          content={
            <Stack color='text.body' lineHeight='short' p={1}>
              <Span color='inherit' lineHeight='inherit'>
                Ranks results based on the presence of unique fields.
              </Span>
              <Span color='inherit'>
                First scores by query, then refines rankings with an additional
                function score.
              </Span>
              <Span color='inherit'>
                Adjusts results based on a calculated metadata score.
              </Span>
            </Stack>
          }
        >
          <Flex>
            <Switch.Root
              checked={isChecked}
              onCheckedChange={handleToggle}
              colorPalette='primary'
              disabled={isDisabled}
            >
              <Switch.Label display='flex'>
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
              </Switch.Label>
              <Switch.HiddenInput />
              <Switch.Control />
            </Switch.Root>
          </Flex>
        </Tooltip>
      </Flex>
    );
  },
);
