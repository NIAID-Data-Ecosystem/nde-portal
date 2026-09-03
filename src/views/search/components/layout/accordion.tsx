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
    <Accordion.Item {...rest}>
      <Accordion.ItemContext>
        {({ expanded }) => (
          <>
            <h2>
              <Accordion.ItemTrigger cursor='pointer'>
                <Heading fontSize='sm' fontWeight='semibold' flex='1' gap={1}>
                  {title}
                </Heading>
                <Icon
                  as={expanded ? FaMinus : FaPlus}
                  fontSize='xs'
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                />
              </Accordion.ItemTrigger>
            </h2>
            <Accordion.ItemContent>
              <Accordion.ItemBody>{children}</Accordion.ItemBody>
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
      collapsible
      multiple
      bg='white'
      variant='enclosed'
      size='lg'
      lazyMount
      {...props}
    >
      {children}
    </Accordion.Root>
  );
};
