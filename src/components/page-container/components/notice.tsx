import React from 'react';
import {Box, Button, Card, Flex, Icon, Link, Text} from 'nde-design-system';
import {IoIosWarning} from 'react-icons/io';
import {useLocalStorage} from 'usehooks-ts';

const Notice = () => {
  let niaid_help = 'help@data.niaid.nih.gov';
  const [isOpen, setOpen] = useLocalStorage('warningOpen', true);

  const toggleWarningOpen = () => {
    setOpen(!isOpen);
  };

  return (
    <Box
      w='100%'
      position={isOpen ? 'absolute' : 'unset'}
      bg='status.warning_lt'
      zIndex={5}
      __css={{
        '>*': {
          px: [4, 4, 6, 8],
        },
      }}
    >
      <Flex
        w='100%'
        bg='status.warning'
        justifyContent='space-between'
        alignItems='center'
        py={2}
        flexWrap='wrap'
      >
        <Flex
          bg='status.warning_lt'
          borderRadius='100%'
          boxSize={8}
          justifyContent='center'
          alignItems='center'
          mr={4}
        >
          <Icon as={IoIosWarning} boxSize={5} m={2} />
        </Flex>

        <Text py={[4, 0]}>
          <strong>
            This is the alpha version of the NIAID Data Ecosystem Discovery
            Portal.
          </strong>
        </Text>
        <Button
          variant='ghost'
          colorScheme='primary'
          _hover={{bg: 'status.warning_lt'}}
          size='sm'
          onClick={toggleWarningOpen}
          w={['100%', 'unset']}
        >
          {!isOpen ? 'Read More' : 'Read Less'}
        </Button>
      </Flex>
      {isOpen && (
        <Box py={[2, 4]}>
          <Text>
            This version is not production ready and is subject to changes.
          </Text>
          For any questions, <Link href={niaid_help}>contact {niaid_help}</Link>
          . +
          <br />
          <Button onClick={toggleWarningOpen} colorScheme='primary' mt={2}>
            Got it
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Notice;
