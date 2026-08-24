import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  SkeletonText,
  List,
} from '@chakra-ui/react';
import { FaAngleDown, FaAngleRight } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import NextLink from 'next/link';
import { extractMarkdownHeadings } from '../../utils/markdown';
import { TocItem } from './TocItem';
import type { DocumentItemProps, ContentHeading } from '../../types';
import { MAX_HEADING_DEPTH } from '../../constants';

export const DocumentItem = ({
  item,
  selectedSlug,
  colorPalette,
  loading,
  activePageSlug,
}: DocumentItemProps) => {
  const isSelected = selectedSlug === item.slug;
  const bg = isSelected ? `${colorPalette}.100` : 'transparent';
  const color = isSelected
    ? `${colorPalette}.600!important`
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
    <List.Item w='100%' display='flex' flexDirection='column'>
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
            // While loading the item name is hidden by the skeleton, so give the
            // link an accessible name to satisfy link-name.
            aria-label={loading ? 'Loading' : undefined}
            _hover={{
              bg: isSelected ? bg : 'blackAlpha.50',
              borderRadius: 'base',
              transition: 'fast',
            }}
          >
            <SkeletonText loading={loading} width={loading ? '75%' : '100%'}>
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
          {hasToc && !loading && (
            <IconButton
              aria-label={isExpanded ? 'Collapse sections' : 'Expand sections'}
              size='sm'
              variant='ghost'
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon as={isExpanded ? FaAngleDown : FaAngleRight} boxSize={4} />
            </IconButton>
          )}
        </Box>
      </Flex>
      {/* Table of contents (TOC) items (sections and subsections): only render depth 2 items, their children will be nested */}
      {hasToc && isExpanded && (
        <List.Root as='ul' ml={0} mt={1}>
          {tocItems
            .filter(tocItem => tocItem.depth === 2)
            .map((tocItem, idx) => (
              <TocItem
                key={idx}
                tocItem={tocItem}
                pageSlug={item.slug as string}
                indent={4}
                parentTocItems={tocItems}
                isParentSelected={isSelected}
                activePageSlug={activePageSlug}
              />
            ))}
        </List.Root>
      )}
    </List.Item>
  );
};
