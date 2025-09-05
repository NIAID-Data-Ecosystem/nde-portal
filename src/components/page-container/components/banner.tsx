import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Separator,
  Flex,
  HStack,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { NoticeProps } from '..';
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaCircleXmark,
} from 'react-icons/fa6';

const getStatusIcon = (status: NoticeProps['state']) => {
  if (status === 'ERROR') {
    return FaCircleXmark;
  } else if (status === 'INFO') {
    return FaCircleInfo;
  } else if (status === 'SUCCESS') {
    return FaCircleCheck;
  } else if (status === 'WARNING') {
    return FaCircleExclamation;
  }
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

  const theme = {
    default: `${state?.toLowerCase()}.default`,
    light: `${state?.toLowerCase()}.light`,
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
      bg={theme.light}
      borderLeft='0.5rem solid'
      borderColor={theme.default}
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
          <Icon
            as={getStatusIcon(state)}
            boxSize={6}
            my={1}
            fill={theme.default}
          />

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
          colorScheme='primary'
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
