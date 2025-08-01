import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import type { Card } from '../types';
import { customMDX } from './Blocks';

interface StepCardProps extends Card {
  step: string;
  children?: React.ReactNode;
}

export const StepCard = ({
  content,
  title,
  icon,
  isRequired,
  tabItems,
  step,
}: StepCardProps) => {
  const MDXComponents = useMDXComponents(customMDX);
  if (!content) {
    return <></>;
  }
  return (
    <Box
      border='1px solid'
      borderColor='gray.100'
      borderRadius='semi'
      my={2}
      textAlign='left'
      fontSize='sm'
    >
      <Flex p={4} position='relative' flexWrap='wrap'>
        <Box flex={1} px={[0, 4]} minW='250px' maxW='500px'>
          <Heading as='h4' fontSize='md' fontWeight='semibold' mt={2} pr={4}>
            {title}
          </Heading>
          {content && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {content}
            </ReactMarkdown>
          )}
        </Box>
        <Text
          fontStyle={isRequired ? 'normal' : 'italic'}
          color='gray.600'
          position='absolute'
          top={1}
          right={2}
        >
          {isRequired ? step : 'Optional'}
        </Text>
      </Flex>
      {tabItems.length > 0 ? (
        <Tabs colorScheme='primary'>
          <TabList px={4}>
            {tabItems.map(({ id, name }) => (
              <Tab
                key={id}
                lineHeight='tall'
                fontSize='inherit'
                color='blackAlpha.500'
                _selected={{
                  borderBottomColor: 'primary.400',
                  color: 'primary.500',
                  ['.tag']: {
                    opacity: 1,
                  },
                }}
              >
                {name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {tabItems.map(({ id, content, icon }) => (
              <TabPanel key={id} bg='page.alt'>
                <Flex
                  p={2}
                  alignItems={['flex-start', 'center']}
                  flexDirection={['column', 'row']}
                >
                  {icon && (
                    <Image
                      m={2}
                      w='35px'
                      h='35px'
                      src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${icon.url}`}
                      alt={icon.alternativeText}
                    />
                  )}
                  <Text p={2} lineHeight='tall' minW='250px'>
                    {content}
                  </Text>
                </Flex>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      ) : (
        <></>
      )}
    </Box>
  );
};
