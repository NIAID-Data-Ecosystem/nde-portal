import {
  Accordion,
  AccordionItemProps,
  Box,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { useState } from 'react';
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
    <Accordion.Item bg='white' {...rest}>
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

const NO_SECTIONS: string[] = [];

/*
 The sections in `defaultValue` start open. Unlike Accordion's own
 `defaultValue`, a new value re-opens the sections to match it, replacing the
 user's own toggles, the way a new search does. The sections stay mounted
 through that, so their results aren't reset. While `holdDefaultValue` is set
 (e.g. the counts it's built from are still loading), a new value waits.
*/
export const AccordionWrapper = ({
  children,
  defaultValue = NO_SECTIONS,
  holdDefaultValue = false,
  onValueChange,
  ...props
}: Accordion.RootProps & { holdDefaultValue?: boolean }) => {
  // Compared by content: callers build `defaultValue` afresh on each render.
  const defaultKey = defaultValue.join('|');
  const [open, setOpen] = useState({ key: defaultKey, value: defaultValue });
  if (!holdDefaultValue && open.key !== defaultKey) {
    setOpen({ key: defaultKey, value: defaultValue });
  }

  return (
    <Accordion.Root
      collapsible
      multiple
      variant='enclosed'
      size='lg'
      lazyMount
      {...props}
      value={open.value}
      onValueChange={details => {
        setOpen(prev => ({ ...prev, value: details.value }));
        onValueChange?.(details);
      }}
    >
      {children}
    </Accordion.Root>
  );
};
