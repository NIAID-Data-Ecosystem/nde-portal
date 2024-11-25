import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Box } from '@chakra-ui/react';
import { CompatibilityBadge } from 'src/views/compatibility';

const ScratchPad: NextPage = () => {
  return (
    <PageContainer
      title='Scratch Pad'
      metaDescription='Scratch Pad page.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent
        w='100%'
        flexDirection='column'
        alignItems='center'
        bg='#fff'
      >
        <Box w='100%' maxW='1600px' mb={32}>
          <CompatibilityBadge />
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default ScratchPad;
