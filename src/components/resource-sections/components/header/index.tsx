import React from 'react';
import { Flex, Heading, Link, Skeleton, Tag, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { DisplayHTMLString } from 'src/components/html-content';
import { formatDOI } from 'src/utils/helpers';

interface HeaderProps {
  isLoading: boolean;
  name?: FormattedResource['name'];
  alternateName?: FormattedResource['alternateName'];
  doi?: FormattedResource['doi'];
  nctid?: FormattedResource['nctid'];
}

const Header: React.FC<HeaderProps> = ({
  isLoading,
  name,
  alternateName,
  doi,
  nctid,
}) => {
  const IDTag = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => {
    return (
      <Tag size='sm' variant='subtle' colorScheme='secondary' px={0} py={0}>
        <Text
          bg='secondary.500'
          color='white'
          px={2}
          py={1}
          borderLeftRadius='inherit'
        >
          {label}
        </Text>
        <Text px={2} py={1} color='inherit'>
          {children}
        </Text>
      </Tag>
    );
  };
  return (
    <>
      <Skeleton
        isLoaded={!isLoading}
        w='100%'
        overflow='unset'
        position={['unset', 'unset', 'sticky']}
        top='0px'
        zIndex='docked'
        bg='white'
        borderBottom='2px solid'
        borderBottomColor='gray.100'
        px={6}
        pt={4}
        pb={2}
      >
        <Heading
          as='h1'
          fontSize='2xl'
          fontWeight='semibold'
          lineHeight={'short'}
        >
          <DisplayHTMLString>{name || alternateName}</DisplayHTMLString>
          {!!name && alternateName && (
            <Heading
              as='h2'
              size='sm'
              color='gray.600'
              fontWeight='normal'
              wordBreak='break-word'
              my={0}
            >
              Alternate name: {alternateName}
            </Heading>
          )}
        </Heading>

        {(nctid || doi) && (
          <Flex mt={2}>
            {nctid && <IDTag label='NCTID'>{nctid}</IDTag>}
            {doi && (
              <IDTag label='DOI'>
                {doi.includes('http') || doi.includes('doi.org') ? (
                  <Link href={doi} isExternal>
                    {formatDOI(doi)}
                  </Link>
                ) : (
                  formatDOI(doi)
                )}
              </IDTag>
            )}
          </Flex>
        )}
      </Skeleton>
    </>
  );
};

export default Header;
