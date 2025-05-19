import { Box, ListItem, Text, UnorderedList } from '@chakra-ui/react';
import Empty from 'src/components/empty';
import { Link } from 'src/components/link';
import { RESERVED_CHARS } from 'src/utils/querystring-helpers';

export const EmptyState = () => {
  return (
    <Empty message='No results found.' alignSelf='center'>
      <Text>No results found. Please try again.</Text>
      <Box
        p={4}
        m={4}
        border='1px solid'
        borderRadius='semi'
        borderColor='page.placeholder'
        bg='niaid.50'
      >
        <Text fontWeight='medium'>Suggestions:</Text>
        <UnorderedList styleType='disc' spacing={1} lineHeight='short'>
          <ListItem listStyleType='inherit'>
            Try using more general keywords.
          </ListItem>
          <ListItem listStyleType='inherit'>
            Use different or fewer keywords.
          </ListItem>
          <ListItem listStyleType='inherit'>
            Ensure that the use of reserved fields in fielded queries are
            intentional and followed by a colon.
          </ListItem>
          <ListItem listStyleType='inherit'>
            Ensure reserved characters ( {RESERVED_CHARS.join(' ')}) are
            preceded by a backslash (\).
          </ListItem>
          <ListItem>
            <Link href={'/knowledge-center/advanced-searching'} isExternal>
              For more information, see the documentation.
            </Link>
          </ListItem>
        </UnorderedList>
      </Box>
    </Empty>
  );
};
