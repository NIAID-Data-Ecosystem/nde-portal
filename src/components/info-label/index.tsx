import React from 'react';
import { Icon, Text, TextProps, TooltipProps } from '@chakra-ui/react';
import { FaInfo } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';

interface InfoLabelProps {
  title: string;
  tooltipText?: string;
  textProps?: TextProps;
  tooltipProps?: TooltipProps;
}

export const InfoLabel: React.FC<InfoLabelProps> = ({
  title,
  tooltipText,
  textProps,
  tooltipProps,
}) => {
  return (
    <Tooltip label={tooltipText} {...tooltipProps}>
      <Text
        fontSize='xs'
        color='gray.800'
        mr={1}
        userSelect='none'
        {...textProps}
      >
        {title}
        {tooltipText && (
          <Icon
            as={FaInfo}
            boxSize={3.5}
            border='1px solid'
            borderRadius='full'
            p={0.5}
            mx={1}
            color='gray.800!important'
          />
        )}
        :
      </Text>
    </Tooltip>
  );
};
