import {
  Accordion,
  AccordionItemProps,
  AccordionRootProps,
  Heading,
} from '@chakra-ui/react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

export const AccordionContent = ({
  title,
  children,
  value,
}: {
  title: string;
  children: React.ReactNode;
  value: AccordionItemProps['value'];
}) => {
  return (
    <Accordion.Item bg='page.alt' value={value}>
      <Accordion.ItemTrigger className='trigger'>
        <Heading
          as='span'
          flex='1'
          textAlign='left'
          size='sm'
          fontWeight='semibold'
        >
          {title}
        </Heading>
        <Accordion.ItemIndicator as={FaPlus} _open={{ display: 'none' }} />
        <Accordion.ItemIndicator as={FaMinus} _closed={{ display: 'none' }} />
      </Accordion.ItemTrigger>

      <Accordion.ItemContent bg='#fff' px={0}>
        <Accordion.ItemBody px={2}>{children}</Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
};

export const AccordionWrapper = ({
  children,
  defaultValue,
  ...props
}: AccordionRootProps) => {
  return (
    <Accordion.Root
      defaultValue={defaultValue ?? ['0']}
      multiple
      boxShadow='sm'
      border='1px solid'
      borderColor='gray.100'
      borderRadius='semi'
      overflow='hidden'
      variant='enclosed'
      {...props}
    >
      {children}
    </Accordion.Root>
  );
};
