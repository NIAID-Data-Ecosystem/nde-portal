import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Separator,
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

import { NoticeProps } from '..';

const StatusIcon = ({ status }: { status: NoticeProps['state'] }) => {
  let icon = null;

  if (status === 'ERROR') {
    icon = FaCircleXmark;
  } else if (status === 'INFO') {
    icon = FaCircleInfo;
  } else if (status === 'SUCCESS') {
    icon = FaCircleCheck;
  } else if (status === 'WARNING') {
    icon = FaCircleExclamation;
  }
  if (!icon) return <></>;

  return (
    <Icon as={icon} boxSize={6} my={1} fill={`${status?.toLowerCase()}`} />
  );
};

export const Banner = ({
  id,
  heading,
  description,
  state,
}: Pick<NoticeProps, 'id' | 'heading' | 'description' | 'state'>) => {
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
      borderColor={`${state?.toLowerCase()}`}
      bg={`${state?.toLowerCase()}.subtle`}
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
          flexDirection={{ base: 'column', sm: 'row' }}
        >
          {/* Status icon */}
          <StatusIcon status={state} />

          {/* Heading */}
          <Heading
            as='p'
            fontSize='md'
            fontWeight='semibold'
            lineHeight='short'
            mt={1}
          >
            {heading}
          </Heading>
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
