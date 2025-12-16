import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FlexProps,
  Icon,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  SkeletonText,
  Text,
  UnorderedList,
  useDisclosure,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import NextLink from 'next/link';
import {
  FaAngleDown,
  FaAnglesLeft,
  FaAnglesRight,
  FaAngleRight,
  FaArrowsUpDown,
} from 'react-icons/fa6';
import LoadingSpinner from 'src/components/loading';
import { ScrollContainer } from 'src/components/scroll-container';
import { extractMarkdownHeadings } from './helpers';
import { useState } from 'react';

interface DocumentationSidebarProps extends FlexProps {
  children: React.ReactNode;
}

const SidebarContainer: React.FC<DocumentationSidebarProps> = ({
  children,
  bg,
  ...props
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });

  return (
    <>
      {!isOpen && (
        <Button
          aria-label='Expand documentation navigation menu'
          onClick={onOpen}
          colorScheme='gray'
          bg={bg || 'white'}
          variant='ghost'
          borderRight='1px solid'
          borderColor='gray.200'
          borderRadius='none'
          px={4}
          display='flex'
          alignItems='flex-start'
        >
          <Icon as={FaAnglesRight} position='sticky' top={4}></Icon>
        </Button>
      )}
      <Box
        className='content'
        bg={bg || 'white'}
        borderRight='1px solid'
        borderColor='gray.100'
        w={isOpen ? '350px' : '0px'}
        transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
        maxW='400px'
        transitionDuration='fast'
        transitionProperty='width, transform'
        transitionTimingFunction='ease'
        {...props}
      >
        <Box position='sticky' top='0px' w='100%' h='100vh'>
          <Flex
            h='100%'
            flexDirection='column'
            overflow={isOpen ? 'visible' : 'hidden'}
          >
            <Button
              aria-label='Collapse documentation navigation menu'
              onClick={onClose}
              colorScheme='gray'
              variant='ghost'
              borderRadius='none'
            >
              <Icon as={FaAnglesLeft}></Icon>
            </Button>
            <ScrollContainer
              as='aside'
              overflowX='hidden'
              overflowY='auto'
              h='100%'
              borderY='1px solid'
              borderColor='gray.200'
              pb={4}
              pr={3}
            >
              {children}
            </ScrollContainer>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default SidebarContainer;

interface ContentHeading {
  title: string;
  hash: string;
  depth: number;
}

export interface SidebarContent {
  id: number;
  name: string;
  items: {
    id: number;
    name: string;
    slug: string | string[];
    description?: string;
    href: {
      pathname: string;
      query?: {
        q?: string;
      };
    };
  }[];
}

export const SidebarMobile = ({
  isLoading,
  menuTitle,
  sections,
  selectedSlug,
  colorScheme = 'niaid',
}: {
  isLoading: boolean;
  menuTitle?: string;
  sections?: SidebarContent[];
  selectedSlug?: string;
  colorScheme?: string;
}) => {
  return (
    <Menu matchWidth>
      <Flex bg='white'>
        <MenuButton
          bg='blackAlpha.100'
          borderRadius='semi'
          color='page.placeholder'
          mx={2}
          my={2}
          flex={1}
          _hover={{ color: 'text.body' }}
        >
          <Flex px={4} py={2} alignItems='center' justifyContent='center'>
            <Text as='span' size='sm' flex={1} color='inherit'>
              {menuTitle || 'Documentation Menu'}
            </Text>
            <Icon as={FaArrowsUpDown} />
          </Flex>
        </MenuButton>
      </Flex>
      <MenuList w='100%'>
        {isLoading && (
          <MenuItem>
            <LoadingSpinner isLoading={isLoading} />
          </MenuItem>
        )}
        {sections?.map(category => {
          return (
            <MenuGroup key={category.id} title={category.name}>
              {category.items.map(item => {
                if (!item?.slug) return null;
                const isSelected = selectedSlug === item.slug;
                return (
                  <NextLink
                    key={item.id}
                    style={{ display: 'flex', width: '100%' }}
                    href={item.href}
                  >
                    <MenuItem
                      pl={6}
                      color={
                        isSelected ? `${colorScheme}.600!important` : 'inherit'
                      }
                      bg={isSelected ? `${colorScheme}.100` : 'transparent'}
                    >
                      <Text fontSize='sm' color='inherit'>
                        {item.name}
                      </Text>
                    </MenuItem>
                  </NextLink>
                );
              })}
            </MenuGroup>
          );
        })}
      </MenuList>
    </Menu>
  );
};

const MAX_HEADING_DEPTH = 3;

interface DocumentItemProps {
  item: SidebarContent['items'][0];
  selectedSlug?: string;
  colorScheme: string;
  isLoading: boolean;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  item,
  selectedSlug,
  colorScheme,
  isLoading,
}) => {
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
  // Only expand if this is the selected page
  const [isExpanded, setIsExpanded] = useState(isSelected);

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
                  colorScheme={colorScheme}
                  parentTocItems={tocItems}
                />
              );
            })}
        </UnorderedList>
      )}
    </ListItem>
  );
};

interface TocItemProps {
  tocItem: ContentHeading;
  pageSlug: string;
  indent: number;
  colorScheme: string;
  parentTocItems?: ContentHeading[];
}

const TocItem: React.FC<TocItemProps> = ({
  tocItem,
  pageSlug,
  indent,
  colorScheme,
  parentTocItems = [],
}) => {
  // Only expand sections that are part of the active page
  const [isExpanded, setIsExpanded] = useState(true);

  // Find child items (subsections)
  const currentIndex = parentTocItems.findIndex(
    item => item.hash === tocItem.hash,
  );

  let childItems: ContentHeading[] = [];
  if (currentIndex !== -1) {
    // Get all items after current
    const itemsAfter = parentTocItems.slice(currentIndex + 1);

    // Find direct children (depth = current + 1) until same or shallower depth is reached
    for (const item of itemsAfter) {
      if (item.depth <= tocItem.depth) {
        // Stop when same or shallower level is hit
        break;
      }
      if (item.depth === tocItem.depth + 1) {
        // Direct child
        childItems.push(item);
      }
    }
  }

  const hasChildren = childItems.length > 0;

  return (
    <ListItem w='100%' display='flex' flexDirection='column'>
      <Flex w='100%' alignItems='center'>
        <NextLink
          style={{ display: 'flex', flex: 1 }}
          href={`/knowledge-center/${pageSlug}#${tocItem.hash}`}
          passHref
        >
          <Box
            as='span'
            flex={1}
            fontSize='sm'
            pl={8 + indent}
            pr={2}
            py={1}
            lineHeight='tall'
            color='text.body'
            bg='transparent'
            cursor='pointer'
            _hover={{
              bg: 'blackAlpha.50',
              borderRadius: 'base',
              transition: 'fast',
            }}
          >
            {tocItem.title}
          </Box>
        </NextLink>
        <Box
          w='40px'
          display='flex'
          justifyContent='center'
          alignItems='center'
          mr={2}
        >
          {hasChildren && (
            <IconButton
              aria-label={
                isExpanded ? 'Collapse subsections' : 'Expand subsections'
              }
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

      {/* Child TOC Items (subsections) */}
      {hasChildren && isExpanded && (
        <UnorderedList ml={0} mt={1}>
          {childItems.map((childItem, idx) => (
            <ListItem key={idx} w='100%' display='flex' alignItems='center'>
              <NextLink
                style={{ display: 'flex', flex: 1 }}
                href={`/knowledge-center/${pageSlug}#${childItem.hash}`}
                passHref
              >
                <Box
                  as='span'
                  flex={1}
                  fontSize='sm'
                  pl={8 + indent + 4}
                  pr={2}
                  py={1}
                  lineHeight='tall'
                  color='text.body'
                  bg='transparent'
                  cursor='pointer'
                  _hover={{
                    bg: 'blackAlpha.50',
                    borderRadius: 'base',
                    transition: 'fast',
                  }}
                >
                  {childItem.title}
                </Box>
              </NextLink>
              <Box w='40px' />
            </ListItem>
          ))}
        </UnorderedList>
      )}
    </ListItem>
  );
};

export const SidebarDesktop = ({
  isLoading,
  sections,
  selectedSlug,
  colorScheme = 'niaid',
}: {
  isLoading: boolean;
  sections?: SidebarContent[];
  selectedSlug?: string;
  colorScheme?: string;
}) => {
  const categories = (
    isLoading
      ? [...Array(5)].map((_, i) => {
          return {
            id: i,
            name: 'Loading...',
            items: [
              {
                id: i,
                name: 'Loading...',
                slug: 'loading',
                href: { pathname: '/', query: { q: 'loading' } },
              },
            ],
          };
        })
      : sections
  ) as SidebarContent[];

  // Find which categories contain the selected page
  const getDefaultExpandedIndices = () => {
    if (!selectedSlug || !categories) return [];

    const expandedIndices: number[] = [];
    categories.forEach((category, index) => {
      const hasSelectedPage = category.items.some(
        item => item.slug === selectedSlug,
      );
      if (hasSelectedPage) {
        expandedIndices.push(index);
      }
    });
    return expandedIndices;
  };

  return (
    <Accordion
      defaultIndex={getDefaultExpandedIndices()}
      allowMultiple
      minW='350px'
    >
      {categories.map(category => {
        return (
          <AccordionItem key={category.id} mt={4} border='none'>
            {({ isExpanded }) => {
              return (
                <>
                  <h2>
                    <AccordionButton p={0} py={2} mb={1}>
                      <SkeletonText
                        isLoaded={!isLoading}
                        width={isLoading ? '80%' : '100%'}
                        noOfLines={1}
                        skeletonHeight={4}
                        display='flex'
                        alignItems='center'
                        flex={1}
                      >
                        <Flex alignItems='center' flex={1} pl={6}>
                          <Text
                            as='span'
                            textAlign='left'
                            fontSize='xs'
                            color='gray.800'
                            textTransform='uppercase'
                            fontWeight='bold'
                            flex={1}
                          >
                            {category.name}
                          </Text>
                        </Flex>
                      </SkeletonText>
                      <Box
                        w='40px'
                        display='flex'
                        justifyContent='center'
                        alignItems='center'
                        mr={2}
                      >
                        {isExpanded ? (
                          <Icon as={FaAngleDown} boxSize={4} />
                        ) : (
                          <Icon as={FaAngleRight} boxSize={4} />
                        )}
                      </Box>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel p={0}>
                    <UnorderedList ml={0}>
                      {category.items.map(item => {
                        if (!item?.slug) return null;
                        return (
                          <DocumentItem
                            key={item.id}
                            item={item}
                            selectedSlug={selectedSlug}
                            colorScheme={colorScheme}
                            isLoading={isLoading}
                          />
                        );
                      })}
                    </UnorderedList>
                  </AccordionPanel>
                </>
              );
            }}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
