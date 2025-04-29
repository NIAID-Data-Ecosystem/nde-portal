import { Box, Divider, Flex, Heading } from '@chakra-ui/react';

interface SectionHeaderProps {
  children: React.ReactNode;
  title: string;
}
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  children,
  title,
}) => {
  return (
    <Box width='100%' mb={2}>
      <Flex justifyContent='space-between' alignItems='center' flexWrap='wrap'>
        <Heading as='h1' size='h5' my={1} ml={0}>
          {title}
        </Heading>

        {children}
      </Flex>
      <Divider />
    </Box>
  );
};
