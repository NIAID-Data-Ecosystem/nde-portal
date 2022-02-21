import React, {Component} from 'react';
import {Creator, SearchResultProps} from 'src/utils/api/types';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Card,
  Divider,
  Flex,
  Heading,
  Link,
  Icon,
  Stack,
  Text,
} from 'nde-design-system';
import {
  FaCalendarAlt,
  FaClock,
  FaLanguage,
  FaMapMarkedAlt,
  FaFileAlt,
  FaFingerprint,
  FaDatabase,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import {IconType} from 'react-icons';

interface SummaryItemProps {
  name: string;
  value: string | string[];
  icon: IconType;
}

const SummaryItem: React.FC<SummaryItemProps> = ({
  name,
  value,
  icon,
  children,
}) => {
  return (
    <Flex direction='column' alignItems='center' w={150} maxWidth={200} p={2}>
      <Heading
        as='h6'
        size='xs'
        fontFamily='body'
        fontWeight='normal'
        whiteSpace='nowrap'
      >
        {name}
      </Heading>
      <Icon as={icon} boxSize={6} maxH={4}></Icon>
      {typeof value === 'string' && (
        <Heading size='xs' fontFamily='body' whiteSpace='nowrap'>
          {value}
        </Heading>
      )}
      {Array.isArray(value) && (
        <Box>
          {value.map(v => {
            return (
              <Heading size='xs' fontFamily={'body'} whiteSpace='nowrap'>
                {value}
              </Heading>
            );
          })}
        </Box>
      )}
      {children}
    </Flex>
  );
};

const DisplayCreators = ({creators}: {creators: Creator[]}) => {
  const getCreatorNames = () => {
    let creator_names = '';
    creators.map((c, index) => {
      const name = creators.length - 1 === index ? c.name : `${c.name}, `;
      creator_names += name;
    });

    return creator_names;
  };

  return (
    <Accordion allowToggle bg={'blackAlpha.50'}>
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
                      `, ${creator.affiliation.name}`}
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

interface DataProps extends SearchResultProps {}

// Empty state display component.
const SearchResult: React.FC<DataProps> = data => {
  const {
    _id,
    name,
    creator,
    curatedBy,
    datePublished,
    inLanguage,
    temporalCoverage,
    spatialCoverage,
    ['@type']: type,
  } = data;

  return (
    <Card width={'100%'} p={0} my={4}>
      <Heading size={'md'} fontFamily={'body'} my={4} p={2}>
        {name}
      </Heading>
      <Divider />
      {/* Display names + affiliations of creators. */}
      <DisplayCreators creators={creator}></DisplayCreators>
      <Divider />

      <Stack
        w={'100%'}
        direction={['column', 'column', 'row']}
        alignItems={['center']}
        spacing={[2, 8]}
        flexWrap={'wrap'}
        p={2}
      >
        {_id && (
          <SummaryItem
            name={'Identifier'}
            value={_id}
            icon={FaFingerprint}
          ></SummaryItem>
        )}
        {type && (
          <SummaryItem
            name={'Type'}
            value={type}
            icon={FaFileAlt}
          ></SummaryItem>
        )}
        {datePublished && (
          <SummaryItem
            name={'Date Published'}
            value={datePublished}
            icon={FaCalendarAlt}
          ></SummaryItem>
        )}

        {curatedBy && curatedBy.name && (
          <Link href={curatedBy.url} _target={'blank'}>
            <SummaryItem
              name={'Source Repository'}
              value={curatedBy.name}
              icon={FaDatabase}
            ></SummaryItem>
            <Icon as={FaExternalLinkAlt}></Icon>
          </Link>
        )}
        {inLanguage && (
          <SummaryItem
            name={'Language'}
            value={
              typeof inLanguage === 'string' ? inLanguage : inLanguage?.name
            }
            icon={FaLanguage}
          ></SummaryItem>
        )}

        {spatialCoverage && (
          <SummaryItem
            name={'Location'}
            value={spatialCoverage}
            icon={FaMapMarkedAlt}
          ></SummaryItem>
        )}

        {temporalCoverage && (
          <SummaryItem
            name={'Period'}
            value={temporalCoverage}
            icon={FaClock}
          ></SummaryItem>
        )}
      </Stack>
      <Divider />
    </Card>
  );
};

export default SearchResult;
