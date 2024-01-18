import React from 'react';
import { ListItem, Text, UnorderedList, ListIcon } from '@chakra-ui/react';
import { FaCircle } from 'react-icons/fa6';
import { getMetadataTheme } from 'src/components/icon/helpers';
import NextLink from 'next/link';
import { Link } from 'src/components/link';

export const MetadataList = ({
  children,
  property,
  showMoreURL,
  maxItemsCount = 3,
}: {
  children: React.ReactNode;
  property: string;
  showMoreURL?: string;
  maxItemsCount?: number;
}) => {
  return (
    <>
      <UnorderedList ml={0}>
        {React.Children.toArray(children)
          .slice(0, maxItemsCount)
          .map((child, idx) => {
            return (
              <ListItem
                key={idx}
                my={2}
                display='flex'
                fontSize='xs'
                lineHeight='short'
              >
                <ListIcon
                  as={FaCircle}
                  m={2}
                  mx={1}
                  boxSize={1}
                  fill={`${getMetadataTheme(property)}.400`}
                />
                {child}
              </ListItem>
            );
          })}
      </UnorderedList>

      {React.Children.count(children) > maxItemsCount && showMoreURL && (
        <NextLink href={showMoreURL}>
          <Link as='div' lineHeight='short' display='flex' ml={4}>
            <Text fontSize='xs' lineHeight='short'>
              Show {React.Children.count(children) - maxItemsCount} other item
              {React.Children.count(children) - maxItemsCount > 1 ? 's' : ''}
            </Text>
          </Link>
        </NextLink>
      )}
    </>
  );
};
