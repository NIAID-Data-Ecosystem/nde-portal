import {
  Accordion,
  AccordionItemProps,
  Box,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

export const AccordionContent = ({
  title,
  children,
  ...rest
}: AccordionItemProps & {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <Accordion.Item bg='bg.alt' {...rest}>
      <Accordion.ItemContext>
        {({ expanded }) => (
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
                <Icon as={expanded ? FaMinus : FaPlus} fontSize='xs' />
              </Accordion.ItemTrigger>
            </h2>
            <Accordion.ItemContent bg='#fff' px={0}>
              <Accordion.ItemBody>
                <Box px={2}>{children}</Box>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </>
        )}
      </Accordion.ItemContext>
    </Accordion.Item>
  );
};

export const AccordionWrapper = ({
  children,
  defaultValue,
  ...props
}: Accordion.RootProps) => {
  return (
    <Accordion.Root
      defaultValue={defaultValue ?? []}
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
