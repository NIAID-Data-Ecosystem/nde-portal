import { Flex, List, Text } from '@chakra-ui/react';
import Empty from 'src/components/empty';
import { Link } from 'src/components/link';
import { RESERVED_CHARS } from 'src/utils/querystring-helpers';

export const EmptyState = () => {
  return (
    <Empty message='No results found.' alignSelf='center'>
      <Text>No results found. Please try again.</Text>
      <Flex
        p={4}
        m={4}
        border='1px solid'
        borderRadius='semi'
        borderColor='page.placeholder'
        bg='niaid.50'
        flexDirection='column'
      >
        <Text fontWeight='medium'>Suggestions:</Text>
        <List.Root as='ul' listStyle='disc' gap={1} lineHeight='short' m={4}>
          <List.Item listStyleType='inherit'>
            Try using more general keywords.
          </List.Item>
          <List.Item listStyleType='inherit'>
            Use different or fewer keywords.
          </List.Item>
          <List.Item listStyleType='inherit'>
            Ensure that the use of reserved fields in fielded queries are
            intentional and followed by a colon.
          </List.Item>
          <List.Item listStyleType='inherit'>
            Ensure reserved characters ( {RESERVED_CHARS.join(' ')}) are
            preceded by a backslash (\).
          </List.Item>
          <List.Item>
            <Link href='/knowledge-center/advanced-searching' isExternal>
              For more information, see the documentation.
            </Link>
          </List.Item>
        </List.Root>
      </Flex>
    </Empty>
  );
};
