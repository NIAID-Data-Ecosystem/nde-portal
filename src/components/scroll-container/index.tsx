import { Box } from '@chakra-ui/react';

export const ScrollContainer = ({ children, ...props }: any) => {
  return (
    <Box
      overflow='auto'
      pr={2}
      sx={{
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '7px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'blackAlpha.100',
          borderRadius: '8px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray.300',
          borderRadius: '8px',
        },
        _hover: {
          '&::-webkit-scrollbar-thumb': {
            background: 'page.placeholder',
          },
        },
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
