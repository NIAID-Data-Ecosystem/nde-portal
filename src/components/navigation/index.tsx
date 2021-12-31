import {
  Box,
  Flex,
  Text,
  IconButton,
  Stack,
  Collapse,
  Image,
  Icon,
  Link,
  Popover,
  PopoverArrow,
  PopoverTrigger,
  PopoverContent,
  useBreakpointValue,
  useDisclosure,
  PopoverBody,
} from '@chakra-ui/react';
import {FaCaretDown, FaChevronRight, FaChevronDown} from 'react-icons/fa';
import {IoClose, IoMenu} from 'react-icons/io5';
import {NavItem} from 'src/components/page-container';

interface NavigationBarProps {
  navItems: Array<NavItem>;
}

const NavigationBar: React.FC<NavigationBarProps> = ({navItems}) => {
  const {isOpen, onToggle} = useDisclosure();
  const isMobile = useBreakpointValue({base: true, md: false});

  const DesktopNav = () => {
    return (
      <Stack direction={'row'} spacing={4}>
        {navItems.map(navItem => (
          <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'}>
              <PopoverTrigger>
                <Flex
                  as={navItem.routes ? Flex : Link}
                  p={2}
                  href={navItem.href ?? '#'}
                  fontSize={'sm'}
                  fontWeight={500}
                  color={'white'}
                  _visited={{color: 'white'}}
                  _hover={{
                    opacity: 0.85,
                    color: 'white',
                  }}
                  variant='no-line'
                  cursor={'pointer'}
                  alignItems={'center'}
                >
                  {navItem.label}
                  {navItem.routes && <Icon as={FaCaretDown} w={4} h={4} />}
                </Flex>
              </PopoverTrigger>

              {navItem.routes && (
                <PopoverContent
                  border={0}
                  boxShadow={'xl'}
                  bg={'white'}
                  p={4}
                  rounded={'xl'}
                  minW={'sm'}
                >
                  <PopoverArrow />
                  <PopoverBody>
                    <Stack>
                      {navItem.routes.map(route => (
                        <DesktopSubNav key={route.label} {...route} />
                      ))}
                    </Stack>
                  </PopoverBody>
                </PopoverContent>
              )}
            </Popover>
          </Box>
        ))}
      </Stack>
    );
  };

  const DesktopSubNav = ({label, href, subLabel}: NavItem) => {
    return (
      <Link
        href={href}
        role={'group'}
        display={'block'}
        p={2}
        color={'nde.primary.700'}
        textDecoration={'none'}
        rounded={'md'}
        _hover={{bg: 'nde.primary.50'}}
        variant='no-line'
      >
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{color: 'nde.primary.500'}}
              fontWeight={600}
            >
              {label}
            </Text>
            <Text fontSize={'sm'} color={'nde.text.body'}>
              {subLabel}
            </Text>
          </Box>
          <Flex
            transition={'all .3s ease'}
            transform={'translateX(-10px)'}
            opacity={0}
            _groupHover={{opacity: '100%', transform: 'translateX(0)'}}
            justify={'flex-end'}
            align={'center'}
            flex={1}
          >
            <Icon
              sx={{
                '> *': {color: 'nde.primary.500'},
              }}
              w={5}
              h={5}
              as={FaChevronRight}
            />
          </Flex>
        </Stack>
      </Link>
    );
  };

  const MobileNav = () => {
    return (
      <Stack bg={'white'} p={2} display={{md: 'none'}} alignItems={'end'}>
        {navItems.map(navItem => (
          <MobileNavItem key={navItem.label} {...navItem} />
        ))}
      </Stack>
    );
  };

  const MobileNavItem = ({label, routes, href}: NavItem) => {
    const {isOpen, onToggle} = useDisclosure();

    return (
      <Stack spacing={4} onClick={routes && onToggle} cursor={'pointer'}>
        <Flex
          p={2}
          as={href ? Link : Box}
          variant={'no-line'}
          href={href ?? '#'}
          justify={'space-between'}
          align={'center'}
          color={href ? 'nde.primary.600' : 'nde.text.heading'}
          rounded={'md'}
          _hover={{
            bg: href ? 'nde.primary.50' : 'transparent',
            color: href ? 'nde.primary.500' : 'nde.text.heading',
          }}
        >
          <Text fontWeight={600}>{label}</Text>
          {routes && (
            <Icon
              as={FaChevronDown}
              transition={'all .25s ease-in-out'}
              transform={isOpen ? 'rotate(180deg)' : ''}
              w={4}
              h={4}
            />
          )}
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <Stack
            mt={0}
            pl={2}
            ml={2}
            borderLeft={1}
            borderStyle={'solid'}
            borderColor={'gray.200'}
            align={'start'}
          >
            {routes &&
              routes.map(route => (
                <Link
                  key={route.label}
                  px={4}
                  py={2}
                  w={'100%'}
                  display={'flex'}
                  href={route.href}
                  color={'nde.primary.700'}
                  textDecoration={'none'}
                  rounded={'md'}
                  variant={'no-line'}
                  _hover={{
                    bg: 'nde.primary.50',
                    color: route.href ? 'nde.primary.500' : 'nde.text.heading',
                  }}
                >
                  {route.label}
                  <Flex
                    transition={'all .3s ease'}
                    transform={'translateX(-10px)'}
                    opacity={0}
                    _hover={{opacity: '100%', transform: 'translateX(0)'}}
                    justify={'flex-end'}
                    align={'center'}
                    flex={1}
                  >
                    <Icon
                      sx={{
                        '> *': {color: 'nde.primary.500'},
                      }}
                      w={5}
                      h={5}
                      as={FaChevronRight}
                    />
                  </Flex>
                </Link>
              ))}
          </Stack>
        </Collapse>
      </Stack>
    );
  };

  return (
    <Box as={'nav'} aria-label={'Main navigation'} w={'100%'}>
      <Flex
        bg='nde.primary.500'
        color={'white'}
        minH={'60px'}
        py={{base: 2}}
        px={{base: 4}}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={'gray.200'}
        align={'center'}
      >
        <Flex
          flex={{base: 1, md: 'auto'}}
          ml={{base: -2}}
          alignItems={'center'}
        >
          <Flex flex={{base: 1}} justify={'start'}>
            <Link
              display='flex'
              alignItems='center'
              href='/landing'
              variant={'no-line'}
            >
              <Image
                w={['220px', '220px', '350px']}
                h={'auto'}
                src={
                  isMobile
                    ? '/assets/logos/nde-logo-acronym-white.svg'
                    : '/assets/logos/nde-logo-white.svg'
                }
                alt={'niaid logo'}
              />
            </Link>
            <Flex
              display={{base: 'none', md: 'flex'}}
              ml={10}
              flex={1}
              justifyContent={'flex-end'}
            >
              <DesktopNav />
            </Flex>
          </Flex>
          <IconButton
            onClick={onToggle}
            display={{base: 'flex', md: 'none'}}
            icon={
              isOpen ? (
                <Icon as={IoClose} w={5} h={5} />
              ) : (
                <Icon as={IoMenu} w={5} h={5} />
              )
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
};

export default NavigationBar;
