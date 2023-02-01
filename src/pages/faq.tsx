import { Flex, Heading } from 'nde-design-system';
import type { NextPage } from 'next';
import { MDXComponents } from 'src/mdx';
import { PageContainer, PageContent } from 'src/components/page-container';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';

interface FrequentlyAskedProps {
  mdxSource: MDXRemoteSerializeResult;
  title: string;
}

const FrequentlyAsked: NextPage<FrequentlyAskedProps> = props => {
  const { mdxSource, title } = props;
  console.log('props', props);
  return (
    <PageContainer
      hasNavigation
      title='FAQ'
      metaDescription='Frequenty asked questions.'
      px={0}
      bg='white'
      py={0}
      disableSearchBar
    >
      <PageContent justifyContent='center'>
        <Flex maxW='1000px' flexDirection='column' mb={32}>
          <Heading as='h1' size='xl' mb={4}>
            {title}
          </Heading>

          <MDXRemote {...mdxSource} components={MDXComponents} />
        </Flex>
      </PageContent>
    </PageContainer>
  );
};

export async function getStaticProps() {
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
        return {
          ...response,
          body: response.body
            .replaceAll('#', '#### ')
            // need to do this because next-mdx-remote doesn't support <details> tag
            .replaceAll('<details>', '<Details>')
            .replaceAll('</details>', '</Details>'),
        };
      })
      .catch(err => console.error(err));

  const res = await fetchData();

  const mdxSource = await serialize(res.body);
  return {
    props: { title: res.title, mdxSource },
  };
}

export default FrequentlyAsked;
