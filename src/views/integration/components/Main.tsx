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
} from '@chakra-ui/react';
import type { NextPage } from 'next';
import { useMDXComponents } from 'mdx-components';
import LocalNavigation from 'src/components/resource-sections/components/navigation';
import { useQuery } from '@tanstack/react-query';
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
import Loading from 'src/components/loading';

interface IntegrationProps {
  data?: { page: ContentProps };
  error?: { message: string; status: number };
}

const IntegrationMain: NextPage<IntegrationProps> = props => {
  const {
    data: content,
    isLoading,
    isFetching,
    error,
  } = useQuery<{ page?: ContentProps }, Error, ContentProps | undefined>({
    queryKey: ['integration-page'],
    queryFn: () => fetchPageContent(),
    placeholderData: { page: props?.data?.page || undefined },
    select: data => data?.page,
  });

  // Retrieve section information (title, slug) from content for the table of contents
  const sections =
    content &&
    content?.attributes &&
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
  const [updatedAt, setUpdatedAt] = useState('');
  useEffect(() => {
    if (content && content?.attributes && content.attributes.updatedAt) {
      const date = new Date(content.attributes.updatedAt).toLocaleString([], {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      setUpdatedAt(date);
    }
  }, [content]);

  return (
    <>
      <Flex
        flexDirection='column'
        flex={1}
        pb={32}
        maxW={{ base: 'unset', lg: '70%' }}
        width='100%'
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
            <Divider orientation='horizontal' mt={8} mb={4} />
            <Text
              fontStyle='italic'
              fontSize='xs'
              color='gray.600'
              textAlign='end'
            >
              Last updated on{' '}
              <Text as='span' fontWeight='semibold'>
                {updatedAt}
              </Text>
            </Text>
          </Flex>
        ) : isLoading || isFetching ? (
          <Loading isLoading={isLoading} />
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
            {sections?.length ? <LocalNavigation routes={sections} /> : <></>}
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </>
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

export const fetchPageContent = async (
  params?: QueryParams,
): Promise<{
  page: ContentProps;
}> => {
  try {
    // in dev/staging mode, show drafts.
    const isProd =
      process.env.NEXT_PUBLIC_BASE_URL === 'https://data.niaid.nih.gov';
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/integration-page`,
      {
        params: {
          publicationState: isProd ? 'live' : 'preview',
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

export default IntegrationMain;
