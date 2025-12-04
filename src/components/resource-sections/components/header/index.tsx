import { Flex, Heading, Skeleton } from '@chakra-ui/react';
import React from 'react';
import { Tag } from 'src/components/tag';
import { FormattedResource } from 'src/utils/api/types';

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
        loading={isLoading}
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
        <Heading as='h1' fontSize='xl' fontWeight='bold' lineHeight='short'>
          {name || alternateName}
        </Heading>
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

        {(nctid || doi) && (
          <Flex mt={2}>
            {nctid && <Tag>{'NCTID |' + nctid}</Tag>}
            {doi && (
              <Tag
                colorPalette='secondary'
                linkProps={{
                  href:
                    doi.includes('http') || doi.includes('doi.org') ? doi : '',
                  isExternal: true,
                }}
              >
                {'DOI |' + doi}
              </Tag>
            )}
          </Flex>
        )}
      </Skeleton>
    </>
  );
};

export default Header;
