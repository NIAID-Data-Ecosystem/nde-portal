import React from 'react';
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
  Image,
  Stack,
  Text,
  Badge,
} from 'nde-design-system';
import {
  FaCalendarAlt,
  FaClock,
  FaLanguage,
  FaMapMarkedAlt,
  FaFileAlt,
  FaFingerprint,
  FaDatabase,
} from 'react-icons/fa';
import {IconType} from 'react-icons';
import Sidebar from '../sidebar';
import ResourceHeader from './components/header';
import Overview from './components/overview';
import CreatorDetails from './components/creator-details';

interface DataProps extends SearchResultProps {}

// Empty state display component.
const ResourceDetails: React.FC<DataProps> = data => {
  const {
    _id,
    name,
    creator,
    curatedBy,
    datePublished,
    description,
    identifier,
    image,
    inLanguage,
    keywords,
    license,
    temporalCoverage,
    spatialCoverage,
    ['@type']: type,
  } = data;

  return (
    <Box w={'100%'}>
      <Flex w={'100%'} height={'100%'}>
        <Card w={'100%'}>
          <ResourceHeader name={name} />
          <CreatorDetails creators={creator}></CreatorDetails>
          <Divider />
          <section id={'overview'} style={{scrollMarginTop: '100px'}}>
            <Overview {...data} />
          </section>
          <Accordion allowToggle allowMultiple defaultIndex={[0, 1]}>
            <section id={'description'} style={{scrollMarginTop: '100px'}}>
              {description && (
                <AccordionItem>
                  <h2>
                    <AccordionButton
                      _expanded={{bg: 'blackAlpha.50', color: 'text.heading'}}
                    >
                      <Box flex='1' textAlign='left'>
                        <Heading fontFamily='body' size='sm'>
                          Description
                        </Heading>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel
                    pb={4}
                    dangerouslySetInnerHTML={{
                      __html: description,
                    }}
                    overflowX={'scroll'}
                  ></AccordionPanel>
                </AccordionItem>
              )}
            </section>
            <section id={'keywords'}>
              {keywords && (
                <AccordionItem>
                  <h2>
                    <AccordionButton
                      _expanded={{bg: 'blackAlpha.50', color: 'text.heading'}}
                    >
                      <Box flex='1' textAlign='left'>
                        <Heading fontFamily='body' size='sm'>
                          Keywords
                        </Heading>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    {keywords.map(keyword => (
                      <Badge
                        key={keyword}
                        m={1}
                        px={1}
                        colorScheme={'secondary'}
                        whiteSpace='normal'
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </AccordionPanel>
                </AccordionItem>
              )}
            </section>
            <section id={'provenance'} style={{scrollMarginTop: '100px'}}>
              {curatedBy && (
                <AccordionItem isFocusable>
                  <h2>
                    <AccordionButton
                      _expanded={{bg: 'blackAlpha.50', color: 'text.heading'}}
                    >
                      <Box flex='1' textAlign='left'>
                        <Heading fontFamily='body' size='sm'>
                          About
                        </Heading>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Box>
                      {image && (
                        <Image src={image} alt={'organization image'} />
                      )}
                      {curatedBy.name && (
                        <Text>
                          <strong>Organization name:</strong> {curatedBy.name}
                        </Text>
                      )}
                      {curatedBy.url && <Text>{curatedBy.url}</Text>}
                      {curatedBy.versionDate && (
                        <Text>
                          <strong>Version Date:</strong>{' '}
                          {new Date(curatedBy.versionDate).toLocaleDateString()}
                        </Text>
                      )}
                      {identifier && (
                        <Text>
                          <strong>DOI:</strong> {identifier}
                        </Text>
                      )}
                      {license && (
                        <Text>
                          <strong>License agreement:</strong> {license}
                        </Text>
                      )}
                    </Box>
                  </AccordionPanel>
                </AccordionItem>
              )}
            </section>
          </Accordion>
        </Card>
      </Flex>
    </Box>
  );
};

export default ResourceDetails;
