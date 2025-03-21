import { FormattedResource } from 'src/utils/api/types';
import { ListItem, UnorderedList } from '@chakra-ui/react';
import { Link } from 'src/components/link';

interface ResourceIsPartOfProps {
  studies: FormattedResource['isPartOf'];
}

const ResourceIsPartOf = ({ studies }: ResourceIsPartOfProps) => {
  if (!studies || !studies.length) return <></>;

  return (
    <UnorderedList ml={2}>
      {studies.map(({ identifier, name, url }, idx) => {
        if (!identifier && !name) {
          return null;
        }
        return (
          <ListItem key={`${idx}`} fontSize='inherit' lineHeight='short'>
            {url ? (
              <Link href={url} isExternal>
                {name || identifier}
              </Link>
            ) : (
              <>{name || identifier}</>
            )}
          </ListItem>
        );
      })}
    </UnorderedList>
  );
};

export default ResourceIsPartOf;
