import { Button, Flex, Icon, Text } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa6';

interface DrillStackBreadcrumbProps {
  label: string;
  moreLabel: string;
  onBack: () => void;
}

export const DrillStackBreadcrumb = ({
  label,
  moreLabel,
  onBack,
}: DrillStackBreadcrumbProps) => (
  <Flex alignItems='center' fontSize='xs' lineHeight='shorter' flex={1}>
    <Button
      size='xs'
      variant='ghost'
      onClick={onBack}
      color='link.color'
      textDecoration='underline'
      mr={1}
    >
      <Icon as={FaArrowLeft} boxSize={3} mr={1} />
      Back
    </Button>
    <Text noOfLines={1}>
      {label} / {moreLabel}...
    </Text>
  </Flex>
);
