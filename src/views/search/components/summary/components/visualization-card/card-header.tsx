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
    <Heading as='h2' fontSize='xs' fontWeight='semibold' lineClamp={1}>
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
    <Tooltip content={tooltipContent} showArrow>
      <Box>
        <IconButton
          aria-label={ariaLabel}
          onClick={onClick}
          variant='ghost'
          cursor='pointer'
          colorPalette='gray'
          boxSize={5}
          p={0.5}
        >
          {icon}
        </IconButton>
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
      <HStack gap={2}>
        {!hasEmptyData && (
          <VisualizationCardIconButton
            ariaLabel='Expand chart to modal view'
            tooltipContent='Expand chart to modal view.'
            icon={
              <Icon>
                <FaExpand />
              </Icon>
            }
            onClick={onExpand}
            disabled={!isActive}
          />
        )}
        <VisualizationCardIconButton
          ariaLabel='Remove chart from display.'
          tooltipContent='Remove chart from display.'
          icon={
            <Icon>
              <FaXmark />
            </Icon>
          }
          onClick={onRemove}
          disabled={!isActive}
        />
      </HStack>
    </Flex>
  );
};
