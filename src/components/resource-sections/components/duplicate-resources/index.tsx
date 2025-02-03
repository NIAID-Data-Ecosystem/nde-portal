import React, { useEffect, useState } from 'react';
import { FlexProps, Text, Flex } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { fetchDuplicateProviders, Duplicate } from './helpers';

interface DuplicateResourcesProps extends FlexProps {
  sameAs?: string | string[];
}

const DuplicateResources: React.FC<DuplicateResourcesProps> = ({
  sameAs,
  ...props
}) => {
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);

  useEffect(() => {
    const getDuplicates = async () => {
      const results = await fetchDuplicateProviders(sameAs);
      setDuplicates(results);
    };

    getDuplicates();
  }, [sameAs]);

  if (duplicates.length === 0) return null;

  const renderDuplicates = () => {
    const count = duplicates.length;
    const links = duplicates.map((duplicate, index) => (
      <React.Fragment key={duplicate.url}>
        <Link href={duplicate.url}>{duplicate.provider}</Link>
        {index < count - 2 ? ', ' : ''}
        {index === count - 2 ? (count > 2 ? ', and ' : ' and ') : ''}
      </React.Fragment>
    ));

    return (
      <Text as='span'>
        See also: duplicate{count > 1 ? 's' : ''} in {links}
      </Text>
    );
  };

  return (
    <Flex
      borderBottom='1px solid'
      borderBottomColor='gray.200'
      py={1}
      display='flex'
    >
      <Flex ml={6} {...props}>
        {renderDuplicates()}
      </Flex>
    </Flex>
  );
};

export default DuplicateResources;
