import { TableContainerProps } from '@chakra-ui/table';
import { TableContainer as NDETableContainer } from '@chakra-ui/react';

export const TableContainer = (props: TableContainerProps) => {
  return (
    <NDETableContainer
      sx={{
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'blackAlpha.100',
          borderRadius: '13px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'gray.300',
          borderRadius: '13px',
        },
        _hover: {
          '&::-webkit-scrollbar-thumb': {
            background: 'niaid.placeholder',
          },
        },
      }}
      {...props}
    >
      {props.children}
    </NDETableContainer>
  );
};
