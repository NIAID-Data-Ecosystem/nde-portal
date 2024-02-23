import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Box } from '@chakra-ui/react';
import { CompatibilityBadge } from 'src/components/compatibility-badge';

const ScratchPad: NextPage = () => {
  return (
    <PageContainer
      hasNavigation
      title='About'
      metaDescription='About page.'
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
        <Box w='100%' maxW='1000px' mb={32}>
          <CompatibilityBadge />
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default ScratchPad;
