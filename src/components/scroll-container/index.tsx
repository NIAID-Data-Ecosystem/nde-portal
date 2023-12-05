import { Box, BoxProps } from 'nde-design-system';

export const ScrollContainer = ({ children, ...props }: BoxProps) => {
  return (
    <Box
      overflow='auto'
      sx={{
        '&::-webkit-scrollbar': {
          width: '7px',
          height: '7px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'blackAlpha.100',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray.300',
          borderRadius: '10px',
        },
        _hover: {
          '&::-webkit-scrollbar-thumb': {
            background: 'niaid.placeholder',
          },
        },
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
