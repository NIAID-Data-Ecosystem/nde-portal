import React from 'react';
import { GetStaticProps, NextPage } from 'next';
import { Flex, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Error } from 'src/components/error';
import { PageContainer, PageContent } from 'src/components/page-container';
import axios from 'axios';
import {
  fetchProgramCollections,
  ProgramCollection,
} from 'src/views/program-collections/helpers';

const ProgramCollections: NextPage<{ data: ProgramCollection[] }> = props => {
  // Fetch program collections from the API
  const { data, isFetching, error } = useQuery({
    queryKey: ['program-collections'],
    queryFn: fetchProgramCollections,
    placeholderData: () => props.data,
    refetchOnWindowFocus: false,
  });

  return (
    <PageContainer
      id='program-page'
      title='Program Collections'
      metaDescription='Appendix of program collections available in the NIAID Data Ecosystem .'
      px={0}
      py={0}
    >
      <PageContent
        id='program-page-content'
        bg='#fff'
        justifyContent='center'
        maxW={{ base: 'unset', lg: '1600px' }}
        margin='0 auto'
        px={4}
        py={4}
        mb={32}
        mt={16}
        flex={1}
      >
        {error ? (
          <Error>
            <Flex flexDirection='column' justifyContent='center'>
              <Text fontWeight='light' color='gray.600' fontSize='lg'>
                API Request:{' '}
                {error?.message ||
                  'It’s possible that the server is experiencing some issues.'}{' '}
              </Text>
            </Flex>
          </Error>
        ) : (
          <Flex
            flexDirection='column'
            flex={1}
            pb={32}
            width='100%'
            // maxW={{ base: 'unset', lg: '70%' }}
            m='0 auto'
          ></Flex>
        )}
      </PageContent>
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async context => {
  return { props: { data: await fetchProgramCollections() } };
};

export default ProgramCollections;
