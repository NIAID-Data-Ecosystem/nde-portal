import { Flex, Text } from '@chakra-ui/react';

export const ErrorMessage = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Flex bg='red.100' px={4} flex={1}>
      <Text color='red.500' fontSize='sm'>
        <Text
          as='span'
          fontWeight='semibold'
          mr={1}
          color='inherit'
          fontSize='inherit'
        >
          {title}
        </Text>
        {children}
      </Text>
    </Flex>
  );
};
