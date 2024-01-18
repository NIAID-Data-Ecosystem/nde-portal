import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { FaTriangleExclamation } from 'react-icons/fa6';
import { useLocalStorage } from 'usehooks-ts';
import { Link } from 'src/components/link';

const Notice = () => {
  let niaid_help = 'NIAIDDataEcosystem@mail.nih.gov';
  const [isOpen, setOpen] = useLocalStorage('warningOpen', true);
  const [isMounted, setIsMounted] = useState(false); // for SSR

  const toggleWarning = () => {
    setOpen(!isOpen);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Box
      w='100%'
      bg='status.warning_lt'
      borderBottom='2px solid'
      borderColor='status.warning'
      zIndex='docked'
      __css={{
        '>*': {
          px: [4, 4, 6, 8],
        },
      }}
    >
      <Flex
        w='100%'
        alignItems='center'
        py={2}
        flexWrap='wrap'
        flexDirection={['column', 'column', 'row']}
      >
        <Icon
          as={FaTriangleExclamation}
          bg='status.warning'
          color='blackAlpha.600'
          borderRadius='100%'
          boxSize={10}
          p={2}
          mr={4}
        />
        <Flex flex={1} flexWrap='wrap' py={[4, 0]}>
          <Text fontWeight='semibold' mx={1}>
            This is the alpha version of the NIAID Data Ecosystem Discovery
            Portal.
          </Text>
          <Text mx={1}>
            Currently using the:{' '}
            <Link
              href={`${process.env.NEXT_PUBLIC_API_URL}/metadata`}
              target='_blank'
            >
              {process.env.NEXT_PUBLIC_API_URL?.includes('api-staging')
                ? 'Staging'
                : process.env.NEXT_PUBLIC_API_URL?.includes('api.data')
                ? 'Production'
                : 'Development'}{' '}
              API
            </Link>
          </Text>
        </Flex>
        <Button
          variant='solid'
          colorScheme='primary'
          size='sm'
          onClick={toggleWarning}
          w={['100%', 'unset']}
        >
          {isMounted && isOpen ? 'Read Less' : 'Read More'}
        </Button>
      </Flex>
      {/* Message is hidden by default and when SSR. */}
      {isMounted && isOpen && (
        <Box py={[2, 4]}>
          <Text>
            This version is not production ready and is subject to changes.
          </Text>
          <Link href={`mailto:${niaid_help}`}>
            <Text>For any questions, contact {niaid_help}.</Text>
          </Link>
          <br />
          <Button
            onClick={toggleWarning}
            colorScheme='primary'
            mt={2}
            size='sm'
          >
            Got it
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Notice;
