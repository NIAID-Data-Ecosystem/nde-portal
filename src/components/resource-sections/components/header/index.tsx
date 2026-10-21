import { Heading, HStack, Skeleton, Text } from '@chakra-ui/react';
import { BookmarkButton } from 'src/components/bookmark-buttons/button';
import { DisplayHTMLString } from 'src/components/html-content';
import { useBookmarkDataset } from 'src/hooks/useBookmarkDataset';
import { FormattedResource } from 'src/utils/api/types';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

interface HeaderProps {
  loading: boolean;
  name?: FormattedResource['name'];
  alternateName?: FormattedResource['alternateName'];
  id?: FormattedResource['id'];
  authors?: React.ReactNode;
}

const Header = ({ loading, name, alternateName, id, authors }: HeaderProps) => {
  const { isFavorited, toggleBookmark, isDisabled } = useBookmarkDataset({
    id,
    name: name || 'N/A',
  });

  const showBookmarkButton = ENABLE_AUTH;

  return (
    <>
      <Skeleton
        loading={loading}
        w='100%'
        overflow='unset'
        position={['unset', 'unset', 'sticky']}
        top='0px'
        zIndex='docked'
        bg='white'
        px={6}
        pt={4}
      >
        <HStack alignItems='flex-start' justifyContent='space-between' w='100%'>
          <Heading
            as='h1'
            fontSize='xl'
            fontWeight='bold'
            lineHeight='moderate'
          >
            <DisplayHTMLString>{name}</DisplayHTMLString>
            {alternateName && (
              <Text
                color='gray.800'
                fontSize='sm'
                fontWeight='normal'
                wordBreak='break-word'
              >
                Alternate names:{' '}
                {Array.isArray(alternateName)
                  ? alternateName.join(', ')
                  : alternateName}
              </Text>
            )}
          </Heading>
          {showBookmarkButton && (
            <BookmarkButton
              isFavorited={isFavorited}
              onClick={toggleBookmark}
              disabled={isDisabled}
            />
          )}
        </HStack>
      </Skeleton>
    </>
  );
};

export default Header;
