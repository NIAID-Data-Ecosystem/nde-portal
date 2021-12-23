import React from 'react';
import {
  Box,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';

interface NavigationProps {
  title: string;
}

/**
 * Navigation accordion for styleguide.
 */

const Navigation: React.FC<NavigationProps> = ({title, children}) => {
  return (
    <Accordion
      width='100%'
      allowToggle
      border='0px'
      borderColor='gray.200'
      position='sticky'
      top={0}
      zIndex={100}
      as='nav'
    >
      <AccordionItem bg='white' id={'nav-accordion-item'}>
        {({isExpanded}) => (
          <>
            <AccordionButton
              borderBottom={isExpanded ? '1px' : '0px'}
              borderColor='gray.200'
            >
              <Box flex='1' textAlign='left'>
                <Heading
                  size='xs'
                  fontFamily='body'
                  my={2}
                  color='niaid.800'
                  letterSpacing='wider'
                  textTransform='uppercase'
                >
                  {title}
                </Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel>{children}</AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default Navigation;
