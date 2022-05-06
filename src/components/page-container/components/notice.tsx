import React from 'react';
import {Box, Button, Flex, Icon, Link, Text} from 'nde-design-system';
import {IoIosWarning} from 'react-icons/io';
import {useLocalStorage} from 'usehooks-ts';

const Notice = () => {
  let niaid_help = 'help@data.niaid.nih.gov';
  const [isOpen, setOpen] = useLocalStorage('warningOpen', true);

  const toggleWarning = () => {
    setOpen(!isOpen);
  };

  return (
    <Box
      w='100%'
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
        <Icon
          as={IoIosWarning}
          bg='status.warning_lt'
          borderRadius='100%'
          boxSize={10}
          p={1}
          mr={4}
        />

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
          onClick={toggleWarning}
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
