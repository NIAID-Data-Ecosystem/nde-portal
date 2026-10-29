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
  variants: {
    variant: {
      // Chakra's `enclosed` without the side borders. Square corners, since a
      // radius with no side borders tapers the top and bottom rules into hooks.
      ruled: {
        root: {
          '--accordion-radius': 'radii.none',
          borderYWidth: '1px',
          divideY: '1px',
          overflow: 'hidden',
        },
        itemTrigger: {
          px: 'var(--accordion-padding-x)',
        },
        itemContent: {
          px: 'var(--accordion-padding-x)',
        },
        item: {
          _open: {
            bg: 'bg.subtle',
          },
        },
      },
    },
  },
});
