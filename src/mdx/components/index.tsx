import { chakra } from '@chakra-ui/react';
import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  UnorderedList,
  OrderedList,
  ListItem,
  Link,
  ImageProps,
} from 'nde-design-system';

export const MDXComponents = {
  Image: (props: ImageProps) => (
    <Flex my='5' justifyContent='center'>
      <Image
        alt='image'
        width={700}
        height={400}
        objectFit='contain'
        {...props}
      />
    </Flex>
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

  p: (props: any) => <Text mt={5} fontSize='md' {...props} />,
  ul: (props: any) => <UnorderedList my={4} ml={12} {...props} />,
  ol: (props: any) => <OrderedList {...props} />,
  li: (props: any) => (
    <ListItem pb='4px' listStyleType='initial' fontSize='md' {...props} />
  ),
  a: (props: any) => <Link {...props} />,
  Flex: (props: any) => <Flex {...props} />,
};
