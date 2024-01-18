import { Box, Button, Flex, Heading, Stack } from '@chakra-ui/react';

interface SectionList {
  id: string;
  numItems: number;
  increaseBy?: number;
  children: React.ReactNode;
  sections: {
    title: string;
    hash: string;
    showMax?: number;
  }[];
  setSections: (
    arg: {
      title: string;
      hash: string;
      showMax?: number;
    }[],
  ) => void;
}

export const SectionList = ({
  id,
  increaseBy = 5,
  numItems,
  children,
  sections,
  setSections,
}: SectionList) => {
  const currentSectionIdx = sections.findIndex(s => s.hash === id);
  const showMax = sections[currentSectionIdx]?.showMax;

  return (
    <Stack flex={1}>
      {children}
      {typeof showMax === 'number' && showMax < numItems && (
        <Flex justifyContent='center' my={4}>
          <Button
            size='sm'
            colorScheme='gray'
            variant='outline'
            onClick={() => {
              const updatedSection = { ...sections[currentSectionIdx] };
              if (updatedSection.showMax && updatedSection.showMax < numItems) {
                updatedSection.showMax += increaseBy;
              }
              const updatedSections = [...sections];
              updatedSections[currentSectionIdx] = updatedSection;
              setSections(updatedSections);
            }}
          >
            Show More
          </Button>
        </Flex>
      )}
    </Stack>
  );
};

export const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Box id={id} w='100%' py={{ base: 0, md: 4 }}>
      <Heading
        as='h2'
        fontSize='2xl'
        bg='white'
        px={2}
        py={4}
        mt={2}
        mb={4}
        borderBottom='1px solid'
        borderBottomColor='blackAlpha.200'
        position='sticky'
        top='0px'
      >
        {title}
      </Heading>
      <Box px={2}>{children}</Box>
    </Box>
  );
};
