import type { MDXComponents } from 'mdx/types';
import {
  Box,
  chakra,
  Collapse,
  Flex,
  Heading,
  Image,
  Link,
  Text,
  UnorderedList,
  OrderedList,
  ListItem,
  ImageProps,
  Icon,
} from 'nde-design-system';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    ...components,
    Image: (props: ImageProps) => (
      <Image
        alt='image'
        width={700}
        height={400}
        objectFit='contain'
        {...props}
      />
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
      <Heading as='h2' size='h2' mt={8} fontSize='3xl' {...props} />
    ),
    h3: (props: any) => (
      <Heading as='h3' size='h3' mt={8} fontSize='2xl' {...props} />
    ),
    h4: (props: any) => (
      <Heading as='h4' size='h4' mt={4} fontSize='xl' {...props} />
    ),

    hr: (props: any) => <chakra.hr {...props} />,
    strong: (props: any) => (
      <Box as='strong' fontWeight='semibold' {...props} />
    ),

    br: () => <br />,
    p: (props: any) => <Text mt={2} fontSize='md' {...props} />,
    ul: (props: any) => (
      <UnorderedList my={4} ml={12}>
        {props.children}
      </UnorderedList>
    ),
    ol: (props: any) => <OrderedList>{props.children}</OrderedList>,
    li: (props: any) => (
      <ListItem pb='4px' listStyleType='initial' fontSize='md'>
        {props.children}
      </ListItem>
    ),
    a: (props: any) => {
      let { href } = props;
      if (href.startsWith('doc:')) {
        href = '';
      }
      return <Link href={href} {...props} />;
    },
    Link: (props: any) => {
      return <Link {...props} />;
    },
    Flex: (props: any) => <Flex {...props} />,
    blockquote: (props: any) => {
      return (
        <Box
          borderLeft='0.2em solid'
          borderLeftColor='status.info'
          px={4}
          py={2}
          mx={{ base: 0, md: 2 }}
          bg='status.info_lt'
          {...props}
        />
      );
    },
    Box: (props: any) => <Box {...props} />,
    Details: (props: any) => {
      const { children } = props;
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Box border='1px solid' borderColor='gray.100' my={0.5}>
          <Flex
            as='button'
            w='100%'
            borderLeft='4px solid'
            p={4}
            alignItems='center'
            cursor='pointer'
            bg={isOpen ? 'secondary.50' : 'white'}
            borderLeftColor={isOpen ? 'secondary.600' : 'secondary.500'}
            boxShadow={isOpen ? 'sm' : 'none'}
            _hover={{
              boxShadow: 'sm',
              bg: 'secondary.50',
            }}
            onClick={() => setIsOpen(!isOpen)}
            {...props}
          >
            <Heading as='h2' fontSize='xl' flex={1} textAlign='left'>
              {children[0]}
            </Heading>
            <Icon
              as={FaChevronDown}
              boxSize={4}
              color={isOpen ? 'secondary.600' : 'secondary.500'}
              transition='transform 250ms ease'
              transform={!isOpen ? `rotate(-90deg)` : `rotate(0deg)`}
              {...props}
            />
          </Flex>

          <Collapse in={isOpen} animateOpacity>
            <Box px={6} py={4} bg='whiteAlpha.800'>
              {children.slice(1)}
            </Box>
          </Collapse>
        </Box>
      );
    },
  };
}