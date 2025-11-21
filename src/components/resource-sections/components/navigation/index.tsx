import { Box, Heading, List } from '@chakra-ui/react';
import { throttle } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { LinkProps } from 'src/components/link';

import { NavLink } from './components/nav-link';

interface LocalNavigationProps {
  routes: { title: string; hash: string; depth?: number }[];
  intersectionObserverOptions?: IntersectionObserverInit;
  itemProps?: Omit<LinkProps, 'onClick'>;
}

const LocalNavigation: React.FC<LocalNavigationProps> = ({
  routes,
  intersectionObserverOptions,
  itemProps,
}) => {
  // Detect active section and update nav accordingly
  const sectionNodesRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(
    routes.length ? routes[0].hash : '',
  );
  const [itemClicked, setItemClicked] = useState(false);

  useEffect(() => {
    let nodes = routes.map(route => document.getElementById(route.hash));
    sectionNodesRefs.current = nodes;
    let observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.map((entry: IntersectionObserverEntry) => {
          setActiveSection(prev => {
            // update active section if element enters screen (unless the user clicks to a particular section)
            return entry.isIntersecting && !itemClicked
              ? entry.target.id
              : prev;
          });
        });
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -100% 0px',
        ...intersectionObserverOptions,
      },
    );

    nodes.forEach(node => node && observer.observe(node));
    return () => observer.disconnect();
  }, [routes, activeSection, itemClicked, intersectionObserverOptions]);

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

  if (!routes || !routes.length) return <></>;

  return (
    <Box as='nav' w='100%' py={6}>
      <Heading as='h2' fontSize='md' fontWeight='semibold' mb={0} px={2}>
        On This Page
      </Heading>

      <List.Root as='ul' ml={0} mt={2} listStyle='none'>
        {routes &&
          routes.map((route, i) => {
            return (
              <List.Item
                key={`${route.hash}-${i}`}
                py={1}
                borderLeft='1px solid'
                borderLeftColor='blackAlpha.200'
              >
                <NavLink
                  pl={`${1 * (route?.depth || 1)}rem`}
                  href={`#${route.hash}`}
                  isSelected={activeSection === route.hash}
                  onClick={() => {
                    setItemClicked(true);
                    setActiveSection(route.hash);
                  }}
                  {...itemProps}
                >
                  {route.title}
                </NavLink>
              </List.Item>
            );
          })}
      </List.Root>
    </Box>
  );
};

export default LocalNavigation;
