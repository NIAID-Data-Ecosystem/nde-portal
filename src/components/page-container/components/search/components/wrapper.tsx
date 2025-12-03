import { Flex, FlexProps, Stack } from '@chakra-ui/react';

/**
 * Wrapper component for search bar section
 * @param props FlexProps
 * @returns JSX.Element
 */
export const Wrapper: React.FC<FlexProps> = ({ children, ...rest }) => {
  return (
    <Flex
      justifyContent='center'
      px={{ base: 4, sm: 4, lg: 6, xl: '5vw' }}
      borderBottom='1px solid'
      borderColor='gray.100'
      {...rest}
    >
      <Stack gap={1} flexDirection='column' py={4} flex={1} maxW='2600px'>
        {children}
      </Stack>
    </Flex>
  );
};
