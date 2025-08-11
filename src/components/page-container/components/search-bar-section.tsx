import { Button, Flex, Icon, Stack } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { SearchBarWithDropdown } from 'src/components/search-bar';

export const SearchBarSection: React.FC = () => {
  return (
    <>
      <Flex
        justifyContent='center'
        px={{ base: 4, sm: 4, lg: 6, xl: '5vw' }}
        borderBottom='1px solid'
        borderColor='gray.100'
      >
        <Stack flexDirection='column' py={4} flex={1} maxW='2000px'>
          <NextLink
            href={{ pathname: '/advanced-search' }}
            passHref
            prefetch={false}
            style={{ alignSelf: 'flex-end' }}
          >
            <Button
              as='span'
              variant='outline'
              size='sm'
              transition='0.2s ease-in-out'
              colorScheme='primary'
              fontWeight='semibold'
              _hover={{
                bg: 'primary.600',
                color: 'white',
                transition: '0.2s ease-in-out',

                svg: {
                  transform: 'translateX(-8px)',
                  transition: '0.2s transform ease-in-out',
                },
              }}
              leftIcon={
                <Icon
                  as={FaMagnifyingGlass}
                  ml={2}
                  boxSize={3}
                  transform='translateX(-4px)'
                  transition='0.2s transform ease-in-out'
                />
              }
            >
              Advanced Search
            </Button>
          </NextLink>
          <SearchBarWithDropdown
            ariaLabel='Search for resources'
            placeholder='Search for resources'
            size='md'
            showSearchHistory
          />
        </Stack>
      </Flex>
    </>
  );
};
