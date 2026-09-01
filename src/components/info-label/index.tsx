import { Icon, Text, TextProps } from '@chakra-ui/react';
import React from 'react';
import { FaInfo } from 'react-icons/fa6';
import type { TooltipProps } from 'src/components/tooltip';
import Tooltip from 'src/components/tooltip';

interface InfoLabelProps extends TextProps {
  children: string;
  tooltipProps?: Omit<TooltipProps, 'children'>;
  iconProps?: Omit<React.ComponentProps<typeof Icon>, 'children'>;
}

const InfoIcon = (
  props: Omit<React.ComponentProps<typeof Icon>, 'children'>,
) => (
  <Icon
    boxSize={3.5}
    border='1px solid'
    borderRadius='full'
    p={0.5}
    mx={1}
    mb={2}
    {...props}
  >
    <FaInfo />
  </Icon>
);

export const InfoLabel: React.FC<InfoLabelProps> = ({
  children,
  tooltipProps,
  iconProps,
  ...textProps
}) => {
  const content = tooltipProps?.content ?? '';
  return (
    <Tooltip showArrow {...tooltipProps} content={content}>
      <Text
        fontSize='xs'
        color='gray.800'
        userSelect='none'
        alignItems='center'
        {...textProps}
      >
        {children}
        {tooltipProps && <InfoIcon {...iconProps} />}
      </Text>
    </Tooltip>
  );
};
