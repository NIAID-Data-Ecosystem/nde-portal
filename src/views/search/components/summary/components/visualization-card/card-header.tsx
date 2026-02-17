import {
  Box,
  Flex,
  Heading,
  HeadingProps,
  HStack,
  Icon,
  IconButton,
  IconButtonProps,
  IconProps,
} from '@chakra-ui/react';
import { FaExpand, FaXmark } from 'react-icons/fa6';

import Tooltip from 'src/components/tooltip';

interface CardHeaderProps {
  label: string;
  hasEmptyData: boolean;
  isActive: boolean;
  onExpand: () => void;
  onRemove: () => void;
}

export const VisualizationCardHeading = ({
  label,
}: HeadingProps & { label: string }) => {
  return (
    <Heading as='h2' fontSize='xs' fontWeight='semibold' noOfLines={1}>
      {label}
    </Heading>
  );
};

export const VisualizationCardIconButton = ({
  icon,
  ariaLabel,
  tooltipContent,
  onClick,
}: Omit<IconButtonProps, 'aria-label' | 'as' | 'icon'> & {
  ariaLabel: string;
  tooltipContent: string;
  icon: React.ReactElement<IconProps>;
}) => {
  return (
    <Tooltip label={tooltipContent} hasArrow>
      <Box>
        <IconButton
          icon={icon}
          aria-label={ariaLabel}
          onClick={onClick}
          variant='ghost'
          cursor='pointer'
          colorScheme='gray'
          boxSize={5}
          p={0.5}
        />
      </Box>
    </Tooltip>
  );
};

export const CardHeader = ({
  label,
  hasEmptyData,
  isActive,
  onExpand,
  onRemove,
}: CardHeaderProps) => {
  return (
    <Flex mb={2} justify='space-between' align='center' lineHeight='shorter'>
      <VisualizationCardHeading label={label} />

      {!hasEmptyData && (
        <HStack gap={2}>
          <VisualizationCardIconButton
            ariaLabel='Expand chart to modal view'
            tooltipContent='Expand chart to modal view.'
            icon={<Icon as={FaExpand} />}
            onClick={onExpand}
            isDisabled={!isActive}
          />
          <VisualizationCardIconButton
            ariaLabel='Remove chart from display.'
            tooltipContent='Remove chart from display.'
            icon={<Icon as={FaXmark} />}
            onClick={onRemove}
            isDisabled={!isActive}
          />
        </HStack>
      )}
    </Flex>
  );
};
