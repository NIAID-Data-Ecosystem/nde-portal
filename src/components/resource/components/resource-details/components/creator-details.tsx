import React from 'react';
import {Creator} from 'src/utils/api/types';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Flex,
  Heading,
  Link,
  Text,
} from 'nde-design-system';

const CreatorDetails = ({creators}: {creators: Creator[]}) => {
  const getCreatorNames = () => {
    let creator_names = '';
    creators.map((c, index) => {
      const name =
        creators.length - 1 === index ||
        c.name.charAt(c.name.length - 1) === ','
          ? `${c.name} `
          : `${c.name}, `;
      creator_names += name;
    });

    return creator_names;
  };

  return (
    <Accordion allowToggle bg={'primary.50'}>
      <AccordionItem>
        {({isExpanded}) => (
          <>
            <AccordionButton>
              <Flex w={'100%'} direction={['column', 'column', 'row']}>
                <Box w={'100%'} flex='1' textAlign='left'>
                  <Heading size='sm' fontFamily={'body'}>
                    {getCreatorNames()}
                  </Heading>
                </Box>
                <Flex alignItems={'center'}>
                  {isExpanded ? (
                    <>
                      <Text fontSize={'xs'}>hide author details</Text>
                      <AccordionIcon />
                    </>
                  ) : (
                    <>
                      <Text fontSize={'xs'}>show author details</Text>
                      <AccordionIcon />
                    </>
                  )}
                </Flex>
              </Flex>
            </AccordionButton>
            <AccordionPanel pb={4} bg={'blackAlpha.100'}>
              {creators.map(creator => {
                let creatorDetails = (
                  <Text>
                    <strong>{creator.name}</strong>{' '}
                    {creator?.affiliation?.name &&
                      `${
                        creator.name.charAt(creator.name.length - 1) === ','
                          ? ' '
                          : ', '
                      } ${creator.affiliation.name}`}
                  </Text>
                );

                return (
                  <Box key={creator.name}>
                    {creator['@id'] ? (
                      // link to orcid if available.
                      <Link href={creator['@id']} isExternal target={'_blank'}>
                        {creatorDetails}
                      </Link>
                    ) : (
                      creatorDetails
                    )}
                  </Box>
                );
              })}
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default CreatorDetails;
