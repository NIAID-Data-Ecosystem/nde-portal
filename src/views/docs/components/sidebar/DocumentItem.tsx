import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  ListItem,
  SkeletonText,
  UnorderedList,
} from '@chakra-ui/react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import NextLink from 'next/link';
import { extractMarkdownHeadings } from '../helpers';
import { TocItem } from './TocItem';
import { DocumentItemProps, ContentHeading } from './types';
import { MAX_HEADING_DEPTH } from './constants';

export const DocumentItem = ({
  item,
  selectedSlug,
  colorScheme,
  isLoading,
  activePageSlug,
}: DocumentItemProps) => {
  const isSelected = selectedSlug === item.slug;
  const bg = isSelected ? `${colorScheme}.100` : 'transparent';
  const color = isSelected
    ? `${colorScheme}.600!important`
    : 'text.body!important';

  // Extract section and subsection names from description
  const tocItems: ContentHeading[] = item.description
    ? extractMarkdownHeadings(item.description, MAX_HEADING_DEPTH)
    : [];

  const hasToc = tocItems.length > 0;

  // Expand only if this is the selected page
  const [isExpanded, setIsExpanded] = useState(isSelected);

  // Update expansion state when activePageSlug changes (force collapse all except active)
  useEffect(() => {
    setIsExpanded(isSelected);
  }, [isSelected, activePageSlug]);

  return (
    <ListItem w='100%' display='flex' flexDirection='column'>
      <Flex w='100%' alignItems='center'>
        <NextLink
          style={{ display: 'flex', flex: 1 }}
          href={item.href}
          passHref
        >
          <Link
            as='span'
            flex={1}
            fontSize='sm'
            px={8}
            py={1}
            lineHeight='tall'
            color={color}
            bg={bg}
            _hover={{
              bg: isSelected ? bg : 'blackAlpha.50',
              borderRadius: 'base',
              transition: 'fast',
            }}
          >
            <SkeletonText
              isLoaded={!isLoading}
              width={isLoading ? '75%' : '100%'}
            >
              {item.name}
            </SkeletonText>
          </Link>
        </NextLink>
        <Box
          w='40px'
          display='flex'
          justifyContent='center'
          alignItems='center'
          mr={2}
        >
          {hasToc && !isLoading && (
            <IconButton
              aria-label={isExpanded ? 'Collapse sections' : 'Expand sections'}
              icon={
                <Icon
                  as={isExpanded ? FaAngleDown : FaAngleRight}
                  boxSize={4}
                />
              }
              size='sm'
              variant='ghost'
              onClick={() => setIsExpanded(!isExpanded)}
            />
          )}
        </Box>
      </Flex>

      {/* Table of contents (TOC) items (sections and subsections): only render depth 2 items, their children will be nested */}
      {hasToc && isExpanded && (
        <UnorderedList ml={0} mt={1}>
          {tocItems
            .filter(tocItem => tocItem.depth === 2)
            .map((tocItem, idx) => {
              return (
                <TocItem
                  key={idx}
                  tocItem={tocItem}
                  pageSlug={item.slug as string}
                  indent={4}
                  parentTocItems={tocItems}
                  isParentSelected={isSelected}
                  activePageSlug={activePageSlug}
                />
              );
            })}
        </UnorderedList>
      )}
    </ListItem>
  );
};
