import { chakra } from '@chakra-ui/react';
import {
  Box,
  Heading,
  Text,
  UnorderedList,
  OrderedList,
  ListItem,
  Link,
} from 'nde-design-system';
import NextImage from 'next/image';

export const MDXComponents = {
  Image: (props: any) => (
    <Box my='5'>
      <NextImage
        layout='responsive'
        width={700}
        height={400}
        objectFit='contain'
        {...props}
      />
    </Box>
  ),
  h1: (props: any) => (
    <Heading
      as='h1'
      size='h1'
      mt={8}
      fontSize={['4xl', '5xl']}
      fontWeight='bold'
      {...props}
    />
  ),
  h2: (props: any) => (
    <Heading as='h2' size='h2' mt={16} fontSize='3xl' {...props} />
  ),
  h3: (props: any) => (
    <Heading as='h3' size='h3' mt={8} fontSize='2xl' {...props} />
  ),
  h4: (props: any) => (
    <Heading as='h4' size='h4' mt={16} fontSize='xl' {...props} />
  ),

  hr: (props: any) => <chakra.hr {...props} />,
  strong: (props: any) => <Box as='strong' fontWeight='semibold' {...props} />,

  br: ({ ...props }) => <br />,

  p: (props: any) => <Text mt={5} {...props} />,
  ul: (props: any) => <UnorderedList {...props} />,
  ol: (props: any) => <OrderedList {...props} />,
  li: (props: any) => <ListItem pb='4px' listStyleType='initial' {...props} />,
  a: (props: any) => <Link {...props} />,
};
