import React, {useEffect, useState} from 'react';
import {
  Flex,
  Button,
  IconButton,
  InputGroup,
  InputRightElement,
  Input,
  VisuallyHidden,
  Icon,
  Link,
  BoxProps,
} from '@chakra-ui/react';
import {FaSearch} from 'react-icons/fa';
import {useRouter} from 'next/router';

interface SearchBarProps extends BoxProps {
  href?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  href,
  ...props
}) => {
  const router = useRouter();

  return (
    <Flex
      as={'form'}
      w={'100%'}
      flexDirection={'column'}
      maxW={['unset', 'unset', '70%', '50%']}
      {...props}
    >
      <InputGroup size={'lg'} flexDirection={'column'}>
        <Input
          bg='white'
          pr={4}
          type='text'
          placeholder={'Search for tool or dataset'}
          focusBorderColor={'nde.primary.400'}
          value={value}
          onChange={onChange}
        ></Input>
        <Button
          aria-label='search datasets'
          isDisabled={!value || value.length < 1}
          onClick={e => {
            e.preventDefault();
            href && router.push(href);
          }}
          type={'submit'}
          display={['flex', 'flex', 'none']}
          colorScheme={'nde.primary'}
          mt={1}
        >
          Search
          <Icon mx={2} as={FaSearch}></Icon>
        </Button>
        <InputRightElement display={['none', 'none', 'flex']} width={'9.5rem'}>
          <Button
            aria-label='search datasets'
            isDisabled={!value || value.length < 1}
            onClick={e => {
              e.preventDefault();
              href && router.push(href);
            }}
            type={'submit'}
            colorScheme={'nde.primary'}
            size={'md'}
            leftIcon={<FaSearch />}
          >
            Search
          </Button>
          <VisuallyHidden>Search Icon</VisuallyHidden>
        </InputRightElement>
      </InputGroup>
    </Flex>
  );
};

export default SearchBar;
