import React from 'react';
import { Box, Card, Heading } from '@chakra-ui/react';

interface CardContainerProps {
  heading: string;
  children: React.ReactNode;
}

/* Card for related datasets section */
export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  heading,
}) => {
  return (
    <Card flex={1} ml={[0, 0, 4]} my={2} sx={{ '>*': { p: [2, 4, 4, 6] } }}>
      <Box w='100%'>
        <Heading
          as='h2'
          size='sm'
          fontWeight='semibold'
          borderBottom='0.5px solid'
          borderColor='page.placeholder'
        >
          {heading}
        </Heading>

        {children}
      </Box>
    </Card>
  );
};
