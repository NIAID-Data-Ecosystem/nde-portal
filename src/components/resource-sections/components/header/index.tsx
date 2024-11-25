import React from 'react';
import { Flex, Heading, Skeleton } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { DisplayHTMLString } from 'src/components/html-content';
import { TagWithUrl } from 'src/components/tag-with-url';

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
        <Heading as='h1' fontSize='2xl' fontWeight='bold' lineHeight='short'>
          <DisplayHTMLString>{name || alternateName}</DisplayHTMLString>
          {!!name && alternateName && (
            <Heading
              as='span'
              size='sm'
              color='gray.800'
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
            {nctid && <TagWithUrl label='NCTID |'>{nctid}</TagWithUrl>}
            {doi && (
              <TagWithUrl
                colorScheme='secondary'
                label='DOI |'
                href={
                  doi.includes('http') || doi.includes('doi.org') ? doi : ''
                }
                isExternal
              >
                {doi}
              </TagWithUrl>
            )}
          </Flex>
        )}
      </Skeleton>
    </>
  );
};

export default Header;
