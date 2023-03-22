import { Flex, Heading, Text } from 'nde-design-system';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { MDXComponents } from 'src/mdx';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Error } from 'src/components/error';

interface FrequentlyAskedProps {
  mdxSource: MDXRemoteSerializeResult;
  title: string;
  error?: { message: string };
}

const FrequentlyAsked: NextPage<FrequentlyAskedProps> = props => {
  const { mdxSource, title, error } = props;

  return (
    <PageContainer
      hasNavigation
      title='FAQ'
      metaDescription='Frequenty asked questions.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent justifyContent='center'>
        {error ? (
          <Error>
            <Flex flexDirection='column' alignItems='center'>
              <Text>{error?.message}</Text>
            </Flex>
          </Error>
        ) : (
          <Flex maxW='1000px' flexDirection='column' mb={32}>
            <Heading as='h1' size='lg' mb={6}>
              {title}
            </Heading>

            <MDXRemote {...mdxSource} components={MDXComponents} />
          </Flex>
        )}
      </PageContent>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const fetchData = () =>
      fetch('https://dash.readme.com/api/v1/docs/frequently-asked-questions', {
        headers: {
          accept: 'application/json',
          authorization: `Basic ${process.env.README_API_KEY}`,
        },
      })
        .then(response => {
          return response.json();
        })
        .then(response => {
          return response;
        })
        .catch(err => {
          console.error(err);
          throw err;
        });

    const res = await fetchData();
    const body = await res.body
      .replace(/#/g, '#### ')
      .replace(/<details>/g, '<Details>')
      .replace(/<\/details>/g, '</Details>');

    const mdxSource = await serialize(body);
    return {
      props: { title: res.title, mdxSource },
    };
  } catch (error) {
    return { props: { error: { message: 'Error retrieving data' } } };
  }
}

export default FrequentlyAsked;
