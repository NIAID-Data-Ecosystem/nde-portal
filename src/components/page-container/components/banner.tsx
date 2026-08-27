import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Separator,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaCircleXmark,
} from 'react-icons/fa6';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import { useLocalStorage } from 'usehooks-ts';

/** Visual states supported by the Banner. */
export type BannerState = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  id: number | string;
  label: string;
  description?: string | null;
  state: BannerState;
}

/** The Strapi notices API returns states uppercased, e.g. `WARNING`. */
export const toBannerState = (state: string): BannerState =>
  state.toLowerCase() as BannerState;

const getStatusIcon = (state: BannerState) => {
  switch (state) {
    case 'error':
      return FaCircleXmark;
    case 'info':
      return FaCircleInfo;
    case 'success':
      return FaCircleCheck;
    case 'warning':
      return FaCircleExclamation;
    default:
      return undefined;
  }
};

export const Banner = ({ id, label, description, state }: BannerProps) => {
  const [isOpen, setOpen] = useLocalStorage(`${id}`, true);
  const [isMounted, setIsMounted] = useState(false); // for SSR
  const MDXComponents = useMDXComponents();
  const toggleWarning = () => {
    setOpen(!isOpen);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Flex
      id={'' + id}
      zIndex='docked'
      flexDirection='column'
      px={4}
      py={2}
      borderLeft='0.5rem solid'
      borderColor={state}
      bg={`${state}.subtle`}
    >
      <HStack
        gap={4}
        flex={1}
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems='flex-end'
      >
        <HStack
          flex={1}
          width='100%'
          gap={{ base: 2, sm: 4 }}
          alignItems='flex-start'
          // flexDirection={{ base: 'column', sm: 'row' }}
        >
          {/* Status icon */}
          <Icon as={getStatusIcon(state)} boxSize={6} my={1} fill={state} />

          <Text fontSize='md' fontWeight='semibold' lineHeight='short'>
            {label}
          </Text>
        </HStack>
        <Button
          onClick={toggleWarning}
          colorPalette='primary'
          size='sm'
          variant='solid'
          mt={{ base: 2, sm: 0 }}
        >
          {isMounted && isOpen ? 'Read Less' : 'Read More'}
        </Button>
      </HStack>
      {/* Description / Additional info */}
      {isMounted && isOpen && description && (
        <Box py={2} fontSize='sm'>
          <Separator />
          <Box px={2}>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={MDXComponents}
            >
              {description}
            </ReactMarkdown>
          </Box>
        </Box>
      )}
    </Flex>
  );
};
