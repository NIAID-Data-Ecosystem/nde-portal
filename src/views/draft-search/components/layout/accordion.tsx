import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionProps,
  Box,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

export const AccordionContent = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <AccordionItem>
      {({ isExpanded }) => (
        <>
          <h2>
            <AccordionButton>
              <Heading
                as='span'
                flex='1'
                textAlign='left'
                size='sm'
                fontWeight='semibold'
              >
                {title}
              </Heading>
              <Icon as={isExpanded ? FaMinus : FaPlus} fontSize='xs' />
            </AccordionButton>
          </h2>
          <AccordionPanel bg='#fff' px={0}>
            <Box px={2}>{children}</Box>
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
};

export const AccordionWrapper = ({
  children,
  defaultIndex,
  ...props
}: AccordionProps) => {
  return (
    <Accordion
      defaultIndex={defaultIndex ?? [0]}
      allowMultiple
      boxShadow='sm'
      border='1px solid'
      borderColor='gray.100'
      borderRadius='semi'
      overflow='hidden'
      {...props}
    >
      {children}
    </Accordion>
  );
};
