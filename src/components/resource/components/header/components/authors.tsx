import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  Text,
  UnorderedList,
  ListItem,
} from 'nde-design-system';
import {FormattedResource, Creator} from 'src/utils/api/types';
import {formatAuthorsList2String} from 'src/utils/helpers';
import {FaMinus, FaPlus} from 'react-icons/fa';

// An accordion containing author details such as name and affiliation + link to their profile pages if available.
const ResourceAuthors = ({authors}: {authors: FormattedResource['author']}) => {
  if (!authors) {
    return null;
  }
  // Check if there's affiliation information in the author list. This will decide if we display the authors in list form in the expand drawer.
  const authorsHaveAffiliation =
    authors.filter(author => !!author.affiliation).length > 0;

  const formatAuthorString = (author: Creator) => {
    if (!author.name) {
      return;
    }
    const formattedAuthor = author.name.replace(/[^a-zA-Z- ]/g, '');

    return (
      <Text>
        <strong>{author.name}</strong>
        {author.affiliation?.name ? ', ' + author.affiliation.name : ''}
      </Text>
    );
  };

  return (
    <Accordion allowToggle borderColor='gray.100'>
      <AccordionItem>
        {({isExpanded}) => (
          <>
            <AccordionButton px={[4, 6]} _hover={{bg: 'page.alt'}}>
              <Flex
                w='100%'
                direction={['column', 'column', 'row']}
                justifyContent='space-between'
              >
                <Box w='100%' flex='1' textAlign='left' mr={6} maxW={700}>
                  <Heading
                    size='sm'
                    fontFamily='body'
                    color='gray.700'
                    fontWeight='semibold'
                  >
                    {formatAuthorsList2String(authors, ',', 10)}
                  </Heading>
                </Box>
                <Flex alignItems='end'>
                  <Flex alignItems='center'>
                    <Text fontSize='xs' fontWeight='light' mx={1}>
                      {isExpanded ? 'collapse' : 'expand'}
                    </Text>
                    <Icon as={isExpanded ? FaMinus : FaPlus} fontSize='xs' />
                  </Flex>
                </Flex>
              </Flex>
            </AccordionButton>
            <AccordionPanel px={[1, 4, 6]} py={4} bg='page.alt'>
              {/* If the author list has an author with affiliation, we display the authors as a vertical list.
              Otherwise, display that authors as a paragraph */}
              <UnorderedList
                display={authorsHaveAffiliation ? '' : 'inline-flex'}
                flexWrap='wrap'
              >
                {authors.map((author, i) => {
                  let url = author?.url;

                  if (!url && author.identifier?.includes('www.orcid')) {
                    url = author.identifier;
                  }

                  return (
                    <ListItem key={author.name || i} display='flex' mr={1}>
                      {/* Link to author's orcid if available */}
                      {url ? (
                        <Link href={url} isExternal target='_blank'>
                          {formatAuthorString(author)}
                        </Link>
                      ) : (
                        <>
                          {formatAuthorString(author)}
                          {i === authors.length - 1 ? '.' : ','}
                        </>
                      )}
                    </ListItem>
                  );
                })}
              </UnorderedList>
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default ResourceAuthors;
