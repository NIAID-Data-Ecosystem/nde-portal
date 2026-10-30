import { Flex, FlexProps } from '@chakra-ui/react';
import { InfoLabel } from 'src/components/info-label';
import type { TooltipProps } from 'src/components/tooltip';

export const OntologyTreeHeaderItem = ({
  label,
  tooltipContent,
  ...rest
}: FlexProps & {
  label: string;
  tooltipContent?: TooltipProps['content'];
}) => {
  return (
    <Flex maxW={130} {...rest}>
      <InfoLabel
        tooltipProps={{ content: tooltipContent }}
        lineHeight='shorter'
      >
        {label}
      </InfoLabel>
    </Flex>
  );
};

export const OntologyTreeHeaders = ({ children, ...rest }: FlexProps) => {
  return (
    <Flex
      alignItems='center'
      borderBottom='0.25px solid'
      borderColor='gray.200'
      gap={2}
      py={2}
      pl={{ base: 4, md: 10 }}
      pr={10}
      {...rest}
    >
      {children}
    </Flex>
  );
};
