import { Icon, Link, Text, TextProps } from '@chakra-ui/react';
import React from 'react';
import { FaInfo } from 'react-icons/fa6';
import type { TooltipProps } from 'src/components/tooltip';
import Tooltip from 'src/components/tooltip';

export interface InfoLabelProps extends TextProps {
  children?: string;
  label?: string;
  /** Renders the label text as a link. */
  href?: string;
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
  href,
  tooltipProps,
  iconProps,
  ...textProps
}) => {
  const content = tooltipProps?.content ?? '';
  const disabled = !tooltipProps || !content || tooltipProps.disabled;
  const text = label || children;
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
        {/* [chakra-to-do]: might want to replace with interactive option */}
        {href ? (
          <Link href={href} color='gray.700'>
            {text}
          </Link>
        ) : (
          text
        )}
        {tooltipProps && content && (
          <InfoIcon disabled={tooltipProps?.disabled} {...iconProps} />
        )}
      </Text>
    </Tooltip>
  );
};
