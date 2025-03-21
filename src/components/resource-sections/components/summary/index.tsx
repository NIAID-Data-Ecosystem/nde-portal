import { FormattedResource } from 'src/utils/api/types';
import {
  Button,
  Flex,
  Icon,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { FaInfo, FaWandMagicSparkles } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';

export const Summary = ({
  description,
  tagLabel,
}: {
  description: FormattedResource['disambiguatingDescription'];
  tagLabel: string;
}) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Flex
      lineHeight='short'
      display='flex'
      alignItems='baseline'
      flexWrap='wrap'
      // mx={2}
      px={4}
      py={3}
      bg='status.info_lt'
      borderRadius='semi'
    >
      <Tooltip label='This summary is based on the description field using ChatGPT4.'>
        <Link
          href='/knowledge-center/ai-generated'
          mx={1}
          fontSize='13px'
          fontWeight='medium'
          letterSpacing='wide'
          textTransform='uppercase'
          whiteSpace={['unset', 'nowrap']}
          lineHeight='inherit'
          textDecoration='underline'
          color='gray.800!important'
          _hover={{ textDecoration: 'none' }}
        >
          SUMMARY{' '}
          <Icon
            as={FaInfo}
            boxSize={3.5}
            border='1px solid'
            borderRadius='full'
            p={0.5}
            color='gray.800!important'
          />
        </Link>
      </Tooltip>

      <Text
        lineHeight='short'
        pt={1}
        mx={1}
        fontSize='lg'
        verticalAlign='bottom'
        noOfLines={isOpen ? undefined : 5}
      >
        <Tag
          variant='solid'
          size='sm'
          mr={1.5}
          colorScheme='niaid'
          bg='status.info'
        >
          <TagLeftIcon as={FaWandMagicSparkles}></TagLeftIcon>
          <TagLabel>{tagLabel}</TagLabel>
        </Tag>
        {description}
      </Text>
      <Flex flex={1} w='100%' justifyContent='flex-end'>
        <Button
          size='xs'
          variant='link'
          m={1}
          color='inherit'
          onClick={onToggle}
        >
          read {isOpen ? 'less' : 'full summary'}
        </Button>
      </Flex>
    </Flex>
  );
};
