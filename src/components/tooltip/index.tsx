import React from 'react';
import {
  Tooltip as ChakraTooltip,
  TooltipProps as ChakraTooltipProps,
} from 'nde-design-system';

interface TooltipProps extends ChakraTooltipProps {}

const Tooltip: React.FC<TooltipProps> = ({ label, children, ...props }) => {
  return (
    <ChakraTooltip
      label={label}
      bg='white'
      color='text.body'
      fontSize='xs'
      fontWeight='normal'
      lineHeight='short'
      border='1px solid'
      borderColor='gray.200'
      {...props}
    >
      {children}
    </ChakraTooltip>
  );
};

export default Tooltip;
