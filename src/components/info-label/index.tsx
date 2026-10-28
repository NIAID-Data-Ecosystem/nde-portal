import { Icon, Text, TextProps } from '@chakra-ui/react';
import React from 'react';
import { FaInfo } from 'react-icons/fa6';
import type { TooltipProps } from 'src/components/tooltip';
import Tooltip from 'src/components/tooltip';

export interface InfoLabelProps extends TextProps {
  children?: string | React.ReactNode;
  label?: string;
  tooltipProps?: Omit<TooltipProps, 'children'>;
  iconProps?: Omit<React.ComponentProps<typeof Icon>, 'children'>;
}

export const InfoIcon = (
  props: Omit<React.ComponentProps<typeof Icon>, 'children'> & {
    disabled?: boolean;
  },
) => (
  <Icon
    className='tooltip-icon'
    boxSize={3.5}
    border='1px solid'
    borderRadius='full'
    color='gray.500'
    mx={1}
    mt='-0.5rem'
    p={0.5}
    {...props}
  >
    <FaInfo />
  </Icon>
);

export const InfoLabel: React.FC<InfoLabelProps> = ({
  children,
  label,
  tooltipProps,
  iconProps,
  ...textProps
}) => {
  const content = tooltipProps?.content ?? '';
  const disabled = !tooltipProps || !content || tooltipProps.disabled;
  return (
    <Tooltip {...tooltipProps} content={content} disabled={disabled}>
      <Text
        fontSize='sm'
        color='text.body'
        userSelect='none'
        alignItems='center'
        w='fit-content'
        cursor={disabled ? 'auto' : 'pointer'}
        _hover={{
          '& .tooltip-icon': {
            bg: disabled ? 'auto' : 'blue.100',
            color: disabled ? 'gray.500' : 'blue.500',
          },
        }}
        {...textProps}
      >
        {label || children}
        {tooltipProps && content && (
          <InfoIcon disabled={tooltipProps?.disabled} {...iconProps} />
        )}
      </Text>
    </Tooltip>
  );
};
