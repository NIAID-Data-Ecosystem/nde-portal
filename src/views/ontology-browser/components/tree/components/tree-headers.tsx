import { Flex, FlexProps, TooltipProps } from '@chakra-ui/react';
import { InfoLabel } from 'src/components/info-label';

export const OntologyTreeHeaderItem = ({
  label,
  tooltipLabel,
}: {
  label: string;
  tooltipLabel?: TooltipProps['label'];
}) => {
  return (
    <Flex maxW={130}>
      <InfoLabel
        title={label}
        tooltipText={tooltipLabel}
        textProps={{ lineHeight: 'shorter' }}
      />
    </Flex>
  );
};

export const OntologyTreeHeaders = ({ children, ...rest }: FlexProps) => {
  return (
    <Flex
      alignItems='center'
      borderBottom='0.25px solid'
      borderColor='gray.200'
      px={4}
      py={2}
      pl={10}
      pr={10}
      {...rest}
    >
      {children}
    </Flex>
  );
};
