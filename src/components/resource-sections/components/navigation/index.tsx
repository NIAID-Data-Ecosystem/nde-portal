import React, { useEffect, useRef, useState } from "react";
import { Box, Card, Heading, ListItem, UnorderedList } from "nde-design-system";
import { throttle } from "lodash";
import { FormattedResource } from "src/utils/api/types";
import { NavLink } from "./components/nav-link";
import { Route } from "../../helpers";

interface LocalNavigationProps {
  data?: FormattedResource;
  routes: Route[];
}

const LocalNavigation: React.FC<LocalNavigationProps> = ({ routes }) => {
  // Detect active section and update nav accordingly
  const sectionNodesRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeSection, setActiveSection] = useState(routes[0].hash);
  const [itemClicked, setItemClicked] = useState(false);

  useEffect(() => {
    let nodes = routes.map((route) => document.getElementById(route.hash));
    sectionNodesRefs.current = nodes;
    let observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.map((e: IntersectionObserverEntry) => {
          setActiveSection((prev) =>
            // update active section if element enters screen (unless the user clicks to a particular section)
            e.isIntersecting && !itemClicked ? e.target.id : prev
          );
        });
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -100%",
      }
    );

    nodes.forEach((node) => node && observer.observe(node));
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

    itemClicked && window.addEventListener("scroll", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, [activeSection, routes, itemClicked]);

  return (
    <Card
      as="nav"
      flex={1}
      ml={[0, 0, 4]}
      my={2}
      sx={{ ">*": { p: [2, 4, 4, 6] } }}
    >
      <Box w="100%">
        <Heading
          as="h2"
          size="sm"
          fontWeight="semibold"
          borderBottom="0.5px solid"
          borderColor="niaid.placeholder"
        >
          On This Page
        </Heading>

        <UnorderedList ml={0} mt={4}>
          {routes &&
            routes.map((route) => {
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
    </Card>
  );
};

export default LocalNavigation;
