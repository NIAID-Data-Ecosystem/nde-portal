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
      color='link'
      textDecoration='underline'
      mr={1}
    >
      <Icon boxSize={3} mr={1}>
        <FaArrowLeft />
      </Icon>
      Back
    </Button>
    <Text lineClamp={1}>
      {label} / {moreLabel}...
    </Text>
  </Flex>
);
