import React, {useEffect, useRef, useState} from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
  useBreakpointValue,
  useDisclosure,
} from 'nde-design-system';
import navigationData from 'configs/resource-navigation.json';
import {throttle} from 'lodash';
import {FormattedResource} from 'src/utils/api/types';

interface NavLinkProps {
  href: string;
  isSelected: boolean;
  onClick: () => void;
}
const NavLink: React.FC<NavLinkProps> = ({isSelected, ...props}) => {
  return (
    <Link
      variant='ghost'
      borderLeft='2px solid'
      borderLeftColor={isSelected ? 'accent.bg' : 'transparent'}
      pl={3}
      _visited={{
        color: 'link.color',
        borderLeftColor: isSelected ? 'accent.bg' : 'transparent',
      }}
      textDecoration={isSelected ? 'underline' : 'none'}
      _hover={{
        textDecoration: 'underline!important',
        borderBottom: 'none!important',
        '*': {borderBottom: 'none!important'},
      }}
      {...props}
    >
      <Text fontSize={'sm'} color={isSelected ? 'primary.400' : 'text.heading'}>
        {props.children}
      </Text>
    </Link>
  );
};

interface navigationConfig {
  title: string;
  routes: {title: string; hash: string; metadataProperty?: string[]}[];
}

interface LocalNavigationProps {
  data: FormattedResource;
}

const LocalNavigation: React.FC<LocalNavigationProps> = ({data}) => {
  const isMobile = useBreakpointValue({base: true, sm: true, md: false});

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

  return (
    <Box as='nav' w='100%'>
      <Heading
        as='h2'
        size='sm'
        fontWeight={'semibold'}
        borderBottom='0.5px solid'
        borderColor='niaid.placeholder'
      >
        On This Page
      </Heading>

      <UnorderedList ml={0} mt={4}>
        {routes &&
          routes.map(route => {
            // Check if data has the metadata for a given section before displaying it in nav bar.
            const navHasSection =
              data &&
              Object.keys(data).filter(d => {
                return (
                  route.metadataProperty?.includes(d) &&
                  data[d as keyof FormattedResource] !== null
                );
              }).length > 0;

            if (!navHasSection) {
              return <></>;
            }

            return (
              <ListItem key={route.title} py={0.5} px={0.25}>
                <NavLink
                  href={`#${route.hash}`}
                  isSelected={activeSection === route.hash}
                  onClick={() => {
                    setItemClicked(true);
                    setActiveSection(route.hash);
                  }}
                >
                  {route.title}
                </NavLink>
              </ListItem>
            );
          })}
      </UnorderedList>
    </Box>
  );
};

export default LocalNavigation;
