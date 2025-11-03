import { Icon, Text, TextProps } from '@chakra-ui/react';
import React from 'react';
import { FaInfo } from 'react-icons/fa6';
import { Tooltip, TooltipProps } from 'src/components/tooltip';

interface InfoLabelProps {
  title: string;
  tooltipText?: TooltipProps['content'];
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
    <Tooltip content={tooltipText} {...tooltipProps}>
      <Text
        fontSize='xs'
        color='gray.800'
        mr={1}
        userSelect='none'
        display='flex'
        alignItems='baseline'
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
          />
        )}
      </Text>
    </Tooltip>
  );
};
