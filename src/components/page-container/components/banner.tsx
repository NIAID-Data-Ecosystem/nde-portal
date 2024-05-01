import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { useLocalStorage } from 'usehooks-ts';
import { useMDXComponents } from 'mdx-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { NoticeProps } from '..';
import { Link } from 'src/components/link';
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaCircleXmark,
} from 'react-icons/fa6';

const StatusIcon = ({ status }: { status: NoticeProps['status'] }) => {
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
    <Icon
      as={icon}
      boxSize={6}
      my={1}
      fill={`status.${status.toLowerCase()}`}
    />
  );
};

export const Banner = ({
  id,
  heading,
  description,
  status,
}: Pick<NoticeProps, 'id' | 'heading' | 'description' | 'status'>) => {
  const [isOpen, setOpen] = useLocalStorage(`${id}`, true);
  const [isMounted, setIsMounted] = useState(false); // for SSR
  const MDXComponents = useMDXComponents({
    a: (props: any) => {
      return (
        <Link
          href={props.href}
          // External links should open in a new tab if not on the same domain.
          isExternal={
            (props.href.startsWith('/') ||
              props.href.startsWith(process.env.NEXT_PUBLIC_BASE_URL)) &&
            props.target !== '_blank'
              ? false
              : true
          }
          textDecoration='underline'
          _hover={{ textDecoration: 'none' }}
        >
          {props.children}
        </Link>
      );
    },
  });
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
      borderColor={`status.${status.toLowerCase()}`}
      bg={`status.${status.toLowerCase()}_lt`}
    >
      <HStack
        spacing={4}
        flex={1}
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems='flex-end'
      >
        <HStack
          flex={1}
          width='100%'
          spacing={{ base: 2, sm: 4 }}
          alignItems='flex-start'
          flexDirection={{ base: 'column', sm: 'row' }}
        >
          {/* Status icon */}
          <StatusIcon status={status} />

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
          <Divider />
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
