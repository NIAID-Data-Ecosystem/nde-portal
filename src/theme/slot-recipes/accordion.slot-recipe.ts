import { defineSlotRecipe } from '@chakra-ui/react';
import { accordionAnatomy } from '@chakra-ui/react/anatomy';

/*
A "show details" / "hide" label inside a trigger underlines while the trigger is
hovered, so the whole row reads as one link-like control.

The anatomy has no slot for that label (it is call-site content, usually inside
an `Accordion.ItemContext` render prop), so the trigger styles it by descendant
selector. Mark the element with `data-accordion-control`:

  <Text data-accordion-control>{expanded ? 'hide' : 'show details'}</Text>

A data attribute rather than a class keeps the hook out of the global class
namespace. Partial recipe: deep-merges into Chakra's default, so only
`itemTrigger._hover` changes.
*/
export const accordionSlotRecipe = defineSlotRecipe({
  slots: accordionAnatomy.keys(),
  base: {
    itemTrigger: {
      cursor: 'pointer',
      _hover: {
        '& [data-accordion-control]': {
          textDecoration: 'underline',
        },
      },
    },
  },
});
