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
      bg: 'white',
      cursor: 'pointer',
      _hover: {
        bg: 'bg.alt',
        '& [data-accordion-control]': {
          textDecoration: 'underline',
        },
      },
    },
  },
  variants: {
    variant: {
      ruled: {
        itemTrigger: {
          borderY: '1px solid',
          borderColor: 'border',
          _open: {
            bg: 'bg.alt',
            '--bg-currentcolor': 'currentColor',
          },
        },
      },
    },
  },
});
