import { Accordion, Box, Heading, Icon } from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

export const AccordionContent = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Accordion.Item bg='page.alt' value='item-0'>
      {({ isExpanded }) => (
        <>
          <h2>
            <Accordion.ItemTrigger>
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
            </Accordion.ItemTrigger>
          </h2>
          <Accordion.ItemContent bg='#fff' px={0}>
            <Accordion.ItemBody>
              <Box px={2}>{children}</Box>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </>
      )}
    </Accordion.Item>
  );
};

export const AccordionWrapper = ({
  children,
  defaultIndex,
  ...props
}: Accordion.RootProps) => {
  return (
    <Accordion.Root
      defaultValue={defaultIndex ?? [0]}
      multiple
      boxShadow='sm'
      border='1px solid'
      borderColor='gray.100'
      borderRadius='semi'
      overflow='hidden'
      {...props}
    >
      {children}
    </Accordion.Root>
  );
};
