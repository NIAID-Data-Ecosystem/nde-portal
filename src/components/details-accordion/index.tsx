import {
  Accordion,
  Box,
  HStack,
  Icon,
  Text,
  useAccordionItemContext,
} from '@chakra-ui/react';
import React from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';

// Single item, so the value only has to be stable, not unique.
const ITEM_VALUE = 'details';

export interface DetailsAccordionProps
  extends Omit<Accordion.RootProps, 'children'> {
  // Always-visible content, rendered in the trigger beside the show/hide control.
  summary: React.ReactNode;
  // Content revealed on expand. Only mounted while expanded.
  children: React.ReactNode;
  showLabel?: string;
  hideLabel?: string;
  // Wraps the trigger in a heading, per the WAI-ARIA accordion pattern. Omit when the summary does not title a section.
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  triggerProps?: Accordion.ItemTriggerProps;
  bodyProps?: Accordion.ItemBodyProps;
}

// The show/hide label and +/- icon. `data-accordion-control` lets the accordion slot recipe underline the label while the trigger is hovered.
const DetailsAccordionControl = ({
  showLabel,
  hideLabel,
}: Pick<DetailsAccordionProps, 'showLabel' | 'hideLabel'>) => {
  const { expanded } = useAccordionItemContext();
  return (
    <HStack gap={1} flexShrink={0} fontSize='xs' fontWeight='light'>
      <Text data-accordion-control>{expanded ? hideLabel : showLabel}</Text>
      {/* `as` rather than a child: react-icons don't forward refs, and Icon's asChild path hands the child one. */}
      <Icon as={expanded ? FaMinus : FaPlus} />
    </HStack>
  );
};

// A single collapsible section: a summary that stays visible with a "show details" / "hide" control beside it, stacking the control below the summary on small screens.
export const DetailsAccordion = ({
  summary,
  children,
  showLabel = 'show details',
  hideLabel = 'hide',
  headingLevel: HeadingTag,
  triggerProps,
  bodyProps,
  ...props
}: DetailsAccordionProps) => {
  const trigger = (
    <Accordion.ItemTrigger
      // Reads the root's padding variable, so variants that pad the content too (`ruled`, `enclosed`) line it up with the trigger.
      px='var(--accordion-padding-x)'
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'flex-start', md: 'flex-end' }}
      gap={{ base: 0, md: 6 }}
      bg='white'
      _hover={{
        bg: 'bg.alt',
      }}
      borderRadius='none'
      {...triggerProps}
    >
      <Box flex='1'>{summary}</Box>
      <DetailsAccordionControl showLabel={showLabel} hideLabel={hideLabel} />
    </Accordion.ItemTrigger>
  );

  return (
    <Accordion.Root
      collapsible
      lazyMount
      unmountOnExit
      variant='plain'
      size='sm'
      css={{ '--accordion-padding-x': { base: 'spacing.4', sm: 'spacing.6' } }}
      {...props}
    >
      <Accordion.Item value={ITEM_VALUE}>
        {HeadingTag ? <HeadingTag>{trigger}</HeadingTag> : trigger}

        <Accordion.ItemContent>
          <Accordion.ItemBody {...bodyProps}>{children}</Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );
};
