import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Flex,
  Heading,
  Highlight,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  ListItem,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  UnorderedList,
  Stack,
} from '@chakra-ui/react';
import {
  DropdownInput,
  InputWithDropdown,
  useDropdownContext,
} from 'src/components/input-with-dropdown';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { remark } from 'remark';
import { DocumentationProps } from './MainContent';

export const searchDocumentation = async (searchTerm: string) => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const docs = await axios.get(
      `${
        process.env.NEXT_PUBLIC_STRAPI_API_URL
      }/api/docs?populate[fields][0]=name&populate[fields][1]=slug&populate[fields][2]=publishedAt&populate[fields][3]=updatedAt&populate[fields][4]=subtitle&populate[fields][5]=description&sort[publishedAt]=desc&sort[updatedAt]=desc&paginate[page]=1&paginate[pageSize]=5&status=${
        isProd ? 'published' : 'draft'
      }&_q=${searchTerm}`,
    );
    return docs.data.data;
  } catch (err: any) {
    throw err.response;
  }
};

function searchInMDX(
  mdxString: string,
  targetWord: string,
  targetLength = 200,
) {
  let nearestHeading = null;
  let snippet = null;

  // Parse the MDX content into mdast
  const tree = remark().parse(mdxString);
  // Helper function to extract text from a node
  function extractText(node: any) {
    if (node.type === 'text' || node.type === 'inlineCode') {
      return node.value;
    } else if (node.children) {
      return node.children.map(extractText).join('');
    }
    return '';
  }

  // Traverse the mdast tree. Stop when the target word is found.
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];

    // Store the nearest preceding heading
    if (node.type === 'heading') {
      let rawHeading = extractText(node);
      nearestHeading = rawHeading
        .toLowerCase() // convert to lowercase
        .replace(/[^a-zA-Z\s]/g, '') // remove non-alpha characters
        .trim() // trim any extra whitespace from start and end
        .replace(/\s+/g, '-'); // replace sequences of whitespace with dash
    }

    // Check if the node contains the target word
    const text = extractText(node);
    const index = text.toLowerCase().indexOf(targetWord.toLowerCase());

    if (index !== -1) {
      let startIndex;
      if (index < targetLength) {
        startIndex = 0;
      } else {
        startIndex = index;
      }

      snippet = text.substr(startIndex, targetLength);
      break;
    }
  }

  return {
    heading: nearestHeading,
    snippet: snippet,
  };
}

interface SearchResult {
  id: DocumentationProps['id'];
  name: DocumentationProps['name'];
  slug: string;
  description: DocumentationProps['description'];
}

interface SearchBarProps extends SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
  results: SearchResult[];
  setResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  onClose: () => void;
}
const SearchBar = ({
  ariaLabel,
  placeholder,
  colorScheme = 'primary',
  size = 'md',
  results,
  setResults,
  onClose,
}: SearchBarProps) => {
  const router = useRouter();
  const { setIsOpen, cursor, getListItemProps, setInputValue } =
    useDropdownContext();

  // Search term entered in search bar.
  const [searchTerm, setSearchTerm] = useState<string>('');

  // debounce search
  const debouncedUpdate = useRef(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 400),
  );

  const updateSearchTerm = useCallback((value: string) => {
    debouncedUpdate.current(value);
  }, []);

  // Run query every time search trm changes.
  const { isLoading, data: queryResults } = useQuery<
    DocumentationProps[],
    Error,
    { id: number; name: string; slug: string; description: string }[]
  >({
    queryKey: ['docs-search', { term: searchTerm }],
    queryFn: () => {
      return searchDocumentation(searchTerm);
    },
    select: data => {
      if (searchTerm.length === 0) {
        return [];
      }
      const results = data.map(datum => {
        const slug = Array.isArray(datum.slug) ? datum.slug[0] : datum.slug;
        if (datum.description) {
          const { heading, snippet } = searchInMDX(
            datum.description,
            searchTerm,
          );
          return {
            id: datum.id,
            name: datum.name,
            slug: heading ? slug + '#' + heading : slug,
            description: snippet,
          };
        }
        return {
          id: datum.id,
          name: datum.name,
          slug,
          description: '',
        };
      });
      return results;
    },
    refetchOnWindowFocus: false,
  });

  // Update results when query results change.
  useEffect(() => {
    setResults(queryResults || []);
  }, [queryResults, setResults]);

  const handleClose = () => {
    onClose();
    updateSearchTerm('');
    setInputValue('');
  };

  const handleSubmit = (_: string, idx: number) => {
    if (idx >= 0 && idx < results.length) {
      router.push(results[idx].slug);
      handleClose();
    }
  };

  return (
    <>
      <Flex w='100%' alignItems='center'>
        <DropdownInput
          id='modal-search-bar'
          ariaLabel={ariaLabel}
          placeholder={placeholder}
          colorScheme={colorScheme}
          size={size}
          type='text'
          onChange={updateSearchTerm}
          onSubmit={handleSubmit}
          getInputValue={() => {
            return searchTerm;
          }}
          onClose={() => {
            updateSearchTerm('');
            setInputValue('');
          }}
        />
      </Flex>

      <Flex
        minHeight='400px'
        flexDirection='column'
        justifyContent='flex-start'
      >
        <Box py={6}>
          {!searchTerm && (
            <Flex flexDirection='column' alignItems='center' margin='0 auto'>
              <Icon
                as={FaMagnifyingGlass}
                boxSize={5}
                color='primary.400'
                mb={4}
              />
              <Text fontWeight='medium' color='gray.600'>
                Start typing to search…
              </Text>
            </Flex>
          )}
          {searchTerm && (!results || !results.length) && !isLoading && (
            <Text fontWeight='medium' color='gray.600' textAlign='center'>
              No search results for &quot;{searchTerm}&quot;.
            </Text>
          )}

          <UnorderedList ml={0} w='100%' maxHeight='500px' overflow='auto'>
            {results?.map((result, index) => {
              const isSelected = cursor === index;

              return (
                <ListItem
                  key={result.id}
                  px={2}
                  mx={2}
                  my={1}
                  {...getListItemProps({
                    index,
                    value: `/knowledge-center/${result.slug}`,
                    isSelected,
                    onClick: () => {
                      router.push(`/knowledge-center/${result.slug}`);
                      handleClose();
                    },
                  })}
                >
                  <Heading
                    as='h4'
                    size='sm'
                    lineHeight='short'
                    color='text.body'
                    wordBreak='break-word'
                    textAlign='left'
                  >
                    {result.name && (
                      <Highlight
                        query={searchTerm.split(' ')}
                        styles={{
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                          color: `${colorScheme}.400`,
                          bg: 'transparent',
                        }}
                      >
                        {result.name}
                      </Highlight>
                    )}
                  </Heading>
                  {result.description && (
                    <Text color='gray.600' fontSize='sm'>
                      <Highlight
                        query={searchTerm.split(' ')}
                        styles={{
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                          color: `${colorScheme}.400`,
                          bg: 'transparent',
                        }}
                      >
                        {result.description}
                      </Highlight>
                    </Text>
                  )}
                </ListItem>
              );
            })}
          </UnorderedList>
        </Box>
      </Flex>
    </>
  );
};
interface SearchBarWithDropdownProps {
  value?: string;
  ariaLabel: string;
  placeholder: string;
  colorScheme?: string;
  size?: string;
}

export const DocsSearchBar = (props: SearchBarWithDropdownProps) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const { open, onOpen, onClose } = useDisclosure();
  const { placeholder, colorScheme = 'primary', size = 'sm' } = props;

  const handleClose = () => {
    onClose();
    setResults([]);
  };
  return (
    <>
      <Stack
        flexDirection={{ base: 'column', sm: 'row' }}
        spacing={2}
        flex={1}
        justifyContent={'flex-end'}
      >
        <Button
          maxWidth={{ base: 'unset', sm: '350px' }}
          variant='unstyled'
          onClick={onOpen}
          flex={1}
        >
          <InputGroup>
            <InputLeftElement>
              <Icon as={FaMagnifyingGlass} color='gray.200' />
            </InputLeftElement>
            <Input as='div' size={size} colorScheme={colorScheme}>
              <Text textAlign='left' color='gray.800'>
                {placeholder}
              </Text>
            </Input>
          </InputGroup>
        </Button>
        <Button size='sm' onClick={onOpen}>
          {placeholder}
        </Button>
      </Stack>
      {open && (
        <Modal isOpen={open} onClose={handleClose} size='5xl'>
          <ModalContent>
            <ModalBody>
              <Box p={6}>
                <InputWithDropdown
                  inputValue=''
                  cursorMax={results.length}
                  colorScheme={colorScheme}
                >
                  <SearchBar
                    results={results}
                    setResults={setResults}
                    onClose={handleClose}
                    {...props}
                  />
                </InputWithDropdown>
              </Box>
            </ModalBody>
            <ModalCloseButton />
          </ModalContent>
        </Modal>
      )}
    </>
  );
};
