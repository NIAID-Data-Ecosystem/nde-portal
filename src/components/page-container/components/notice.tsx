import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Icon, Link, Text } from 'nde-design-system';
import { IoIosWarning } from 'react-icons/io';
import { useLocalStorage } from 'usehooks-ts';

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
      zIndex='docked'
      __css={{
        '>*': {
          px: [4, 4, 6, 8],
        },
      }}
    >
      <Flex
        w='100%'
        bg='status.warning'
        alignItems='center'
        py={2}
        flexWrap='wrap'
      >
        <Icon
          as={IoIosWarning}
          bg='status.warning_lt'
          borderRadius='100%'
          boxSize={10}
          p={1}
          mr={4}
        />
        <Flex flex={1} flexWrap='wrap' py={[4, 0]}>
          <Text fontWeight='semibold'>
            This is the alpha version of the NIAID Data Ecosystem Discovery
            Portal.
          </Text>
          <Text px={[0, 2]} fontWeight='normal'>
            Currently using the:{' '}
            <Link
              href={`${process.env.NEXT_PUBLIC_API_URL}/metadata`}
              // target='_blank'
            >
              {process.env.NEXT_PUBLIC_API_URL?.includes('staging')
                ? 'Staging'
                : 'Production'}{' '}
              API
            </Link>
          </Text>
        </Flex>
        <Button
          variant='ghost'
          colorScheme='primary'
          _hover={{ bg: 'status.warning_lt' }}
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
          <Button onClick={toggleWarning} colorScheme='primary' mt={2}>
            Got it
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Notice;
