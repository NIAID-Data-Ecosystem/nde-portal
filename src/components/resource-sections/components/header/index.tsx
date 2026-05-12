import { Flex, Heading, Skeleton, Text } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { DisplayHTMLString } from 'src/components/html-content';
import { TagWithUrl } from 'src/components/tag-with-url';
import { CopyButton } from 'src/components/copy-button';

interface HeaderProps {
  isLoading: boolean;
  name?: FormattedResource['name'];
  alternateName?: FormattedResource['alternateName'];
  id?: FormattedResource['id'];
  doi?: FormattedResource['doi'];
  nctid?: FormattedResource['nctid'];
}

const Header = ({
  isLoading,
  name,
  alternateName,
  id,
  doi,
  nctid,
}: HeaderProps) => {
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

        {id && (
          <Flex
            mt={2}
            gap={3}
            alignItems={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
          >
            <Flex gap={2} alignItems='center'>
              <Text fontWeight='semibold' whiteSpace='nowrap'>
                Resource ID
              </Text>
              <Text wordBreak='break-all'>{id}</Text>
            </Flex>
            <CopyButton
              textToCopy={id}
              buttonText='Copy ID'
              copiedText='Resource ID copied!'
              buttonProps={{
                size: 'sm',
                flexShrink: 0,
              }}
            />
          </Flex>
        )}

        {(nctid || doi) && (
          <Flex mt={2} gap={2}>
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
