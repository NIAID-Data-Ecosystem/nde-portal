import React from 'react';
import { TooltipProps as ChakraTooltipProps } from '@chakra-ui/react';
import { Tooltip as ChakraTooltip } from '@/components/ui/tooltip';
import { theme } from 'src/theme';

interface TooltipProps extends ChakraTooltipProps {}

const Tooltip: React.FC<TooltipProps> = ({ label, children, ...props }) => {
  return (
    <ChakraTooltip
      label={label}
      bg='white'
      color='text.body'
      fontSize='13px'
      fontWeight='normal'
      lineHeight='short'
      border='1px solid'
      borderColor='gray.200'
      arrowShadowColor={theme.colors.gray[200]}
      {...props}
    >
      {children}
    </ChakraTooltip>
  );
};

export default Tooltip;
