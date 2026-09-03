import { Icon, IconButton, Text } from '@chakra-ui/react';
import { FaChartPie } from 'react-icons/fa6';

export const FiltersDisclaimer = () => {
  return (
    <Text
      fontSize='sm'
      lineHeight='moderate'
      textAlign='start'
      _icon={{ verticalAlign: 'baseline', mx: 1.5 }}
    >
      Click the icon
      <Icon color='gray.500'>
        <FaChartPie />
      </Icon>
      next to a filter to show or hide the display of its chart. A filled icon
      <Icon color='secondary.500'>
        <FaChartPie />
      </Icon>
      indicates the chart is visible.
    </Text>
  );
};

export const FiltersChartToggle = ({
  isActive,
  name,
  onClick,
}: {
  isActive: boolean;
  name: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <IconButton
      aria-label={
        isActive
          ? `Remove ${name} visualisation chart`
          : `Add ${name} visualisation chart`
      }
      variant='ghost'
      size='xs'
      onClick={onClick}
      my={1}
      colorPalette={isActive ? 'secondary' : 'gray'}
      color='colorPalette.500'
    >
      <FaChartPie />
    </IconButton>
  );
};
