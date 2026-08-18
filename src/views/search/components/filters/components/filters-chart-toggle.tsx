import { Icon, IconButton, Text } from '@chakra-ui/react';
import { FaChartPie } from 'react-icons/fa6';

export const FiltersDisclaimer = () => {
  return (
    <Text fontSize='sm' lineHeight='short' textAlign='start'>
      Click the icon{' '}
      <Icon color='gray.500' mx={1} asChild>
        <FaChartPie />
      </Icon>
      next to a filter to show or hide the display of its chart. A filled icon
      <Icon color='secondary.500' mx={1} asChild>
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
      color={isActive ? 'secondary.500' : 'gray.500'}
      colorPalette={isActive ? 'secondary' : 'gray'}
      _hover={{
        backgroundColor: isActive ? 'secondary.50' : 'gray.50',
      }}
      css={{
        '& >svg': {
          color: isActive ? 'secondary.400' : 'gray.400',
        },
      }}
    >
      <FaChartPie />
    </IconButton>
  );
};
