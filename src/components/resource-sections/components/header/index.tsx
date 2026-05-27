import { Heading, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { DisplayHTMLString } from 'src/components/html-content';
import { TagWithUrl } from 'src/components/tag-with-url';
import { CopyIconButton } from 'src/components/copy-button';

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
        <Heading as='h1' fontSize='xl' fontWeight='bold' lineHeight='short'>
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
        <VStack alignItems='flex-start' mt={2} lineHeight='shorter'>
          {id && (
            <HStack
              alignItems={{ base: 'flex-start', md: 'baseline' }}
              flexDirection={{ base: 'column', md: 'row' }}
              fontSize='sm'
              gap={1}
            >
              <HStack>
                <Text fontWeight='semibold' whiteSpace='nowrap'>
                  Resource ID |
                </Text>
                <Text wordBreak='break-all'>{id}</Text>
              </HStack>
              <CopyIconButton
                textToCopy={id}
                buttonText='Copy ID'
                copiedText='Resource ID copied!'
                buttonProps={{
                  size: 'xs',
                  flexShrink: 0,
                }}
              />
            </HStack>
          )}

          {(nctid || doi) && (
            <>
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
            </>
          )}
        </VStack>
      </Skeleton>
    </>
  );
};

export default Header;
