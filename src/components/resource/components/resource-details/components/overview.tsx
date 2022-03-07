import React from 'react';
import {SearchResultProps} from 'src/utils/api/types';
import {Box, Flex, Heading, Link, Icon, Stack} from 'nde-design-system';
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
    <Flex direction='column' alignItems='center' p={2}>
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

// Summary component containing key info about resource
const Overview: React.FC<SearchResultProps> = data => {
  const {
    curatedBy,
    datePublished,
    identifier,
    inLanguage,
    temporalCoverage,
    spatialCoverage,
    ['@type']: type,
  } = data;

  return (
    <Stack
      w={'100%'}
      direction={['column', 'column', 'row']}
      alignItems={['center']}
      spacing={[2, 8]}
      flexWrap={'wrap'}
      p={2}
    >
      {identifier && (
        <SummaryItem
          name={'DOI'}
          value={identifier}
          icon={FaFingerprint}
        ></SummaryItem>
      )}

      {type && (
        <SummaryItem name={'Type'} value={type} icon={FaFileAlt}></SummaryItem>
      )}
      {datePublished && (
        <SummaryItem
          name={'Date Published'}
          value={datePublished}
          icon={FaCalendarAlt}
        ></SummaryItem>
      )}

      {curatedBy && curatedBy.name && (
        <Link href={curatedBy.url} isExternal>
          <SummaryItem
            name={'Source Repository'}
            value={curatedBy.name}
            icon={FaDatabase}
          ></SummaryItem>
        </Link>
      )}
      {inLanguage && (
        <SummaryItem
          name={'Language'}
          value={typeof inLanguage === 'string' ? inLanguage : inLanguage?.name}
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
  );
};

export default Overview;
