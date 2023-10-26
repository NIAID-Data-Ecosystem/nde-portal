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
  Link,
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
} from 'nde-design-system';
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import NextLink from 'next/link';
import { FaAngleDown, FaAngleRight, FaArrowsUpDown } from 'react-icons/fa6';
import LoadingSpinner from 'src/components/loading';

interface DocumentationSidebarProps extends FlexProps {
  children: React.ReactNode;
}

const SidebarContainer: React.FC<DocumentationSidebarProps> = ({
  children,
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
          bg='white'
          variant='ghost'
          borderRight='1px solid'
          borderColor='gray.200'
          borderRadius='none'
          px={4}
          display='flex'
          alignItems='flex-start'
        >
          <Icon as={FaAngleDoubleRight} position='sticky' top={4}></Icon>
        </Button>
      )}
      <Box
        bg='white'
        borderRight='1px solid'
        borderColor='gray.100'
        w={isOpen ? '300px' : '0px'}
        transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
        maxW='350px'
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
              <Icon as={FaAngleDoubleLeft}></Icon>
            </Button>
            <Box
              as='nav'
              overflowX='hidden'
              overflowY='auto'
              h='100%'
              borderY='1px solid'
              borderColor='gray.200'
              pb={4}
              sx={{
                '&::-webkit-scrollbar': {
                  width: '7px',
                  height: '7px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'blackAlpha.100',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'gray.300',
                  borderRadius: '10px',
                },
                _hover: {
                  '&::-webkit-scrollbar-thumb': {
                    background: 'niaid.placeholder',
                  },
                },
              }}
            >
              {children}
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default SidebarContainer;

export interface SidebarContent {
  id: number;
  name: string;
  items: {
    id: number;
    name: string;
    slug: string | string[];
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
  colorScheme = 'tertiary',
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
          color='niaid.placeholder'
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
                const isSelected = selectedSlug === item.slug;
                return (
                  <NextLink
                    key={item.id}
                    style={{ display: 'flex', width: '100%' }}
                    href={item.href}
                  >
                    <MenuItem
                      pl={6}
                      aria-selected={isSelected}
                      _selected={{
                        color: `${colorScheme}.600!important`,
                        bg: `${colorScheme}.100`,
                      }}
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

export const SidebarDesktop = ({
  isLoading,
  sections,
  selectedSlug,
  colorScheme = 'tertiary',
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

  return (
    <Accordion
      defaultIndex={categories?.map((_, i) => i)}
      allowMultiple
      minW='300px'
    >
      {categories.map(category => {
        return (
          <AccordionItem key={category.id} mt={4} border='none'>
            {({ isExpanded }) => {
              return (
                <>
                  <h2>
                    <AccordionButton p={6} py={2} mb={1}>
                      <SkeletonText
                        isLoaded={!isLoading}
                        width={isLoading ? '80%' : '100%'}
                        noOfLines={1}
                        skeletonHeight={4}
                        display='flex'
                        alignItems='center'
                      >
                        <Flex alignItems='center'>
                          <Text
                            as='span'
                            // flex='1'
                            textAlign='left'
                            fontSize='xs'
                            color='gray.800'
                            textTransform='uppercase'
                            fontWeight='bold'
                            mr={2}
                          >
                            {category.name}
                          </Text>
                          {isExpanded ? (
                            <Icon as={FaAngleDown} boxSize={3} mx={2} />
                          ) : (
                            <Icon as={FaAngleRight} boxSize={3} mx={2} />
                          )}
                        </Flex>
                      </SkeletonText>
                    </AccordionButton>
                  </h2>
                  <AccordionPanel p={0}>
                    <UnorderedList ml={0}>
                      {category.items.map((item, i) => {
                        const isSelected = selectedSlug === item.slug;
                        return (
                          <ListItem key={item.id} w='100%' display='flex'>
                            <NextLink
                              style={{ display: 'flex', width: '100%' }}
                              href={item.href}
                              passHref
                            >
                              <Link
                                as='span'
                                w='100%'
                                fontSize='sm'
                                px={8}
                                py={1}
                                aria-selected={isSelected}
                                color='text.body!important'
                                bg='transparent'
                                lineHeight='tall'
                                _selected={{
                                  color: `${colorScheme}.600!important`,
                                  bg: `${colorScheme}.100`,
                                }}
                                _hover={{
                                  [`&[aria-selected=false]`]: {
                                    bg: 'blackAlpha.50',
                                    borderRadius: 'base',
                                    transition: 'fast',
                                  },
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
                          </ListItem>
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
