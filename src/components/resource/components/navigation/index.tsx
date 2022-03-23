import React, {useEffect, useRef, useState} from 'react';
import {
  Flex,
  Heading,
  Icon,
  Text,
  Button,
  useBreakpointValue,
  useDisclosure,
  Collapse,
  Stack,
  Box,
} from 'nde-design-system';
import navigationData from 'configs/resource-navigation.json';
import {FaChevronDown} from 'react-icons/fa';
import {IoClose} from 'react-icons/io5';
import {
  StyledNavigation,
  StyledNavigationContent,
  StyledNavigationBar,
  StyledNavigationLinks,
  StyledLink,
  StyledResourceType,
} from './styles';
import {useRouter} from 'next/router';
import {throttle} from 'lodash';

interface NavLinkProps {
  key: string;
  href: string;
  isSelected: boolean;
  onClick: () => void;
}
const NavLink: React.FC<NavLinkProps> = ({isSelected, ...props}) => {
  return (
    <StyledLink isSelected={isSelected} variant='unstyled' {...props}>
      <Text
        fontSize={'12px'}
        fontWeight='semibold'
        textTransform={'uppercase'}
        color={isSelected ? 'primary.400' : 'text.heading'}
      >
        {props.children}
      </Text>
    </StyledLink>
  );
};

// Navigation with quicklinks to sections in the resource page.
interface navigationConfig {
  title: string;
  routes: {title: string; hash: string}[];
}

const Navigation: React.FC<{resourceType?: string | null}> = ({
  resourceType,
}) => {
  const isMobile = useBreakpointValue({base: true, sm: true, md: false});

  const {isOpen, onToggle} = useDisclosure();

  // Navigation config
  const {routes} = navigationData as navigationConfig;

  // Set secondary nav bar underneath primary nav bar.
  const ref = useRef<HTMLDivElement>(null);
  const [marginTop, setMarginTop] = useState(0);
  useEffect(() => {
    setMarginTop(ref?.current?.parentElement?.offsetTop || 0);
  }, []);

  // Detect active section and update nav accordingly
  const sectionNodesRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(routes[0].hash);
  const [itemClicked, setItemClicked] = useState(false);

  useEffect(() => {
    let nodes = routes.map(route => document.getElementById(route.hash));
    sectionNodesRefs.current = nodes;
    let observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.map((e: IntersectionObserverEntry) => {
          setActiveSection(prev =>
            // update active section if element enters screen (unless the user clicks to a particular section)
            e.isIntersecting && !itemClicked ? e.target.id : prev,
          );
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -100%',
      },
    );

    nodes.forEach(node => node && observer.observe(node));
    return () => observer.disconnect();
  }, [routes, activeSection, itemClicked]);

  // If user clicks on section, update the active section state.
  React.useEffect(() => {
    const updateActiveSection = throttle(() => {
      const active_section_el = document.getElementById(activeSection);
      if (window.scrollY <= 400) {
        // if scroll is at top of page set to first section.
        setItemClicked(false);
        setActiveSection(routes[0].hash);
      } else if (
        active_section_el !== null &&
        active_section_el.offsetTop > window.innerHeight + window.scrollY
      ) {
        setItemClicked(false);
      } else if (
        active_section_el !== null &&
        itemClicked === true &&
        window.scrollY >
          active_section_el?.offsetTop + active_section_el?.clientHeight
      ) {
        setItemClicked(false);
      }
    }, 500);

    itemClicked && window.addEventListener('scroll', updateActiveSection);
    return () => {
      window.removeEventListener('scroll', updateActiveSection);
    };
  }, [activeSection, routes, itemClicked]);

  const NavigationLinks = ({isOpen}: {isOpen: boolean}) => {
    return (
      <StyledNavigationLinks>
        <Collapse in={isOpen || !isMobile} animateOpacity endingHeight={'100%'}>
          <Stack
            alignItems={'end'}
            w={'100%'}
            h={'100%'}
            direction={['column', 'column', 'row']}
          >
            {routes &&
              routes.map(route => (
                <NavLink
                  key={route.title}
                  href={`#${route.hash}`}
                  isSelected={activeSection === route.hash}
                  onClick={() => {
                    setItemClicked(true);
                    setActiveSection(route.hash);
                  }}
                >
                  {route.title}
                </NavLink>
              ))}
          </Stack>
        </Collapse>
      </StyledNavigationLinks>
    );
  };

  return (
    <StyledNavigation as='nav' ref={ref} top={`60px`} position='sticky'>
      <NavigationLinks isOpen={isOpen} />
      {/* {routes && (
          <Button
            onClick={onToggle}
            color='black'
            display={{base: 'flex', md: 'none'}}
            _hover={{bg: 'blackAlpha.500'}}
            variant='ghost'
            aria-label='Toggle Navigation'
          >
            <Text mr={1}>Sections</Text>
            <Flex w={5} h={5} alignItems='center' justifyContent='center'>
              {isOpen ? (
                <Icon as={IoClose} w={5} h={5} />
              ) : (
                <Icon as={FaChevronDown} w={3} h={3} />
              )}
            </Flex>
          </Button>
        )} */}
    </StyledNavigation>
  );
};

export default Navigation;
