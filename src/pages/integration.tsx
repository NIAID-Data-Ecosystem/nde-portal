import React, { useEffect, useState } from 'react';
import {
  Box,
  Circle,
  Divider,
  Flex,
  Heading,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from 'nde-design-system';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { useMDXComponents } from 'mdx-components';
import LocalNavigation from 'src/components/resource-sections/components/navigation';
import { useQuery } from 'react-query';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import type { ContentProps } from 'src/views/integration/types';
import { Error } from 'src/components/error';
import Empty from 'src/components/empty';
import {
  ParagraphSection,
  ListBlock,
} from 'src/views/integration/components/Blocks';
import { StepCard } from 'src/views/integration/components/Card';
import { FaLightbulb } from 'react-icons/fa6';
import { useRouter } from 'next/router';

interface IntegrationProps {
  data: { page: ContentProps };
  error?: { message: string; status: number };
}

const Integration: NextPage<IntegrationProps> = props => {
  const [content, setContent] = useState(props?.data?.page || null);
  const [error, setError] = useState(props?.error || null);

  const { isLoading } = useQuery<
    {
      page: ContentProps;
    },
    any,
    { page: ContentProps }
  >(['integration-page'], () => fetchPageContent(), {
    onSuccess(data) {
      if (!data || !data.page) {
        return null;
      }
      setContent(data.page);
    },
    onError(err) {
      setError(err);
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Retrieve section information (title, slug) from content for the table of contents
  const sections =
    content &&
    content.attributes &&
    Object.values(content.attributes).reduce((r, block) => {
      if (block && typeof block === 'object') {
        if (Array.isArray(block)) {
          block.map(({ title, slug }) => {
            if (title && slug) {
              r.push({
                title,
                hash: slug,
              });
            }
          });
        } else if (block.title && block.slug) {
          r.push({ title: block.title, hash: block.slug });
        }
      }
      return r;
    }, [] as { title: string; hash: string }[]);

  const MDXComponents = useMDXComponents({});

  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false); // local storage for SSR.

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isMounted && error && +error?.status === 404) {
    router.push('/404');
    return <></>;
  }

  return (
    <PageContainer
      hasNavigation
      title='Integration'
      metaDescription='Information on integrating your data into the NIAID Data Ecosystem Discovery Portal.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent
        bg='#fff'
        maxW={{ base: 'unset', lg: '1600px' }}
        margin='0 auto'
        mb={32}
        px={[4, 6]}
        justifyContent='center'
        flex={1}
      >
        <Flex
          flexDirection='column'
          px={[4, 8]}
          maxW={{ base: 'unset', lg: '60%' }}
          flex={1}
          width='100%'
          minW='300px'
          m='0 auto'
        >
          {error ? (
            <Error bg='#fff'>
              <Flex flexDirection='column' alignItems='center'>
                <Text fontWeight='light' color='gray.600' fontSize='lg'>
                  API Request:{' '}
                  {error?.message ||
                    'It’s possible that the server is experiencing some issues.'}{' '}
                </Text>
              </Flex>
            </Error>
          ) : content?.attributes.title ? (
            <Flex flexDirection='column'>
              <Heading as='h1' size='xl' mt={6} mb={2}>
                {content.attributes.title}
              </Heading>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, remarkGfm]}
                components={MDXComponents}
              >
                {content.attributes.description}
              </ReactMarkdown>
              {/* Overview */}
              {content.attributes.overview?.map(
                ({ description, ...props }, index) => {
                  const [descriptionText, listItems] =
                    description?.split('<hr/>') || [];
                  return (
                    <ParagraphSection
                      key={props.id}
                      description={descriptionText}
                      imagePosition={index % 2 == 0 ? 'right' : 'left'}
                      {...props}
                    >
                      {listItems && <ListBlock>{listItems}</ListBlock>}
                    </ParagraphSection>
                  );
                },
              )}
              {content.attributes.tabs ? (
                <ParagraphSection
                  id={content.attributes.tabs.id}
                  title={content.attributes.tabs.title}
                  slug={content.attributes.tabs.slug}
                  textAlign='center'
                >
                  <Tabs colorScheme='primary'>
                    <TabList>
                      {content.attributes.tabs.panels?.map(({ id, title }) => (
                        <Tab
                          key={id}
                          fontSize='sm'
                          color='blackAlpha.500'
                          _selected={{
                            borderBottomColor: 'primary.400',
                            color: 'primary.500',
                            ['.tag']: {
                              opacity: 1,
                            },
                          }}
                        >
                          {title}
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {content.attributes.tabs.panels?.map(({ id, cards }) => {
                        let stepIndex = 0;
                        const total_steps = cards?.filter(
                          card => card.content && card.isRequired,
                        ).length;
                        return (
                          <TabPanel key={id} p={0} py={2}>
                            {cards?.map(card => {
                              if (card.isRequired) {
                                stepIndex++;
                              }
                              return (
                                <React.Fragment key={card.id}>
                                  {card.additionalInfo && (
                                    <Flex
                                      alignItems='center'
                                      bg='status.warning_lt'
                                      borderRadius='semi'
                                      p={2}
                                      flexWrap='wrap'
                                    >
                                      <Circle bg='whiteAlpha.900' p={2} m={2}>
                                        <Icon
                                          as={FaLightbulb}
                                          color='status.warning'
                                          boxSize={4}
                                        />
                                      </Circle>
                                      <Text
                                        p={2}
                                        textAlign='left'
                                        flex={1}
                                        fontSize='sm'
                                        minW='250px'
                                        lineHeight='tall'
                                      >
                                        {card.additionalInfo}
                                      </Text>
                                    </Flex>
                                  )}
                                  <StepCard
                                    step={`${stepIndex}/${total_steps}`}
                                    {...card}
                                  />
                                </React.Fragment>
                              );
                            })}
                          </TabPanel>
                        );
                      })}
                    </TabPanels>
                  </Tabs>
                </ParagraphSection>
              ) : (
                <></>
              )}
              {content.attributes?.textBlocks &&
                content.attributes.textBlocks?.map((block, i) => {
                  return (
                    <React.Fragment key={block.id}>
                      {i === content.attributes.textBlocks!.length - 1 && (
                        <Divider />
                      )}
                      <ParagraphSection textAlign='center' {...block} />
                    </React.Fragment>
                  );
                })}
            </Flex>
          ) : (
            <Empty>No content for this page exists.</Empty>
          )}
        </Flex>
        <Box
          flex={1}
          position='sticky'
          top='0px'
          w='100%'
          h='100vh'
          minW='250px'
          maxW='350px'
          display={{ base: 'none', lg: 'block' }}
          flexDirection='column'
        >
          {sections?.length || isLoading ? (
            <Box position='sticky' top='0px'>
              {sections?.length ? (
                <LocalNavigation
                  routes={sections}
                  itemProps={{
                    borderLeftColor: 'primary.400',
                  }}
                />
              ) : (
                <></>
              )}
            </Box>
          ) : (
            <></>
          )}
        </Box>
      </PageContent>
    </PageContainer>
  );
};

interface QueryParams {
  publicationState?: string;
  fields?: string[];
  populate?:
    | {
        [key: string]: {
          fields: string[];
        };
      }
    | string;
  sort?: string;
  paginate?: { page?: number; pageSize?: number };
}

const fetchPageContent = async (
  params?: QueryParams,
): Promise<{
  page: ContentProps;
}> => {
  try {
    // in dev/staging mode, show drafts.
    const isProd = process.env.NODE_ENV;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/integration-page`,
      {
        params: {
          publicationState: isProd ? 'preview' : '',
          populate: [
            'overview.image',
            'tabs.panels.cards.icon',
            'tabs.panels.cards.tabItems.icon',
            'textBlocks',
          ],
          ...params,
        },
      },
    );
    return { page: response.data.data };
  } catch (err: any) {
    throw err;
  }
};

export async function getStaticProps() {
  try {
    const data = await fetchPageContent()
      .then(res => res)
      .catch(err => {
        throw JSON.stringify(err);
      });

    return { props: { data } };
  } catch (error: any) {
    return {
      props: {
        data: [],
        error: JSON.parse(error),
      },
    };
  }
}

export default Integration;
