import React from 'react';
import type {NextPage} from 'next';
import PageContainer from 'src/components/page-container';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import {getResourceById} from 'src/utils/api';
import {SearchResultProps} from 'src/utils/api/types';
import Empty from 'src/components/empty';
import {SearchResult} from 'src/components/search-result';

/*
To do:
[ ] Empty case
[ ] Loading case
[ ] Error case
*/
const Dataset: NextPage = props => {
  const router = useRouter();
  const {id} = router.query;

  // Access query client
  const {isLoading, error, data} = useQuery<SearchResultProps, Error>(
    ['search-result', {id}],
    () => getResourceById(id),
  );

  console.log(data);

  if (!id) {
    return <></>;
  }
  if (isLoading) {
    return (
      <PageContainer
        hasNavigation
        title='Dataset'
        metaDescription='Selected search result page.'
      >
        LOADING
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        hasNavigation
        title='Dataset'
        metaDescription='Selected search result page.'
      >
        ERROR
      </PageContainer>
    );
  }

  return (
    <PageContainer
      hasNavigation
      title='Dataset'
      metaDescription='Selected search result page.'
    >
      {!data ? (
        <Empty message={'No dataset to display.'} />
      ) : (
        <SearchResult {...data}></SearchResult>
      )}
    </PageContainer>
  );
};

export default Dataset;
