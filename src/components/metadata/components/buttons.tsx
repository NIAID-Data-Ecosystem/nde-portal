import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Icon,
  IconButtonProps,
  VisuallyHidden,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaMagnifyingGlass, FaSitemap } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';

/*
`attached` styling comes from the `data-first` / `data-last` / `style` props that
ButtonGroup clones onto each of its direct children, and its CSS only matches
direct DOM children. So each button below must:
  - forward its rest props to the `Button`, and
  - keep `Tooltip` on the outside — `Tooltip.Trigger asChild` merges into the
    `Button`, which merges into the anchor, so the group still sees one `<a>`.
*/
export const MetadataButtonGroup = ({
  children,
  ...props
}: ButtonGroupProps) => {
  return (
    <ButtonGroup size='2xs' attached variant='outline' {...props}>
      {children}
    </ButtonGroup>
  );
};

export interface OntologyButtonProps extends Omit<IconButtonProps, 'value'> {
  value?: string;
  inDefinedTermSet?: string;
  label?: string;
}
export const OntologyButton = ({
  'aria-label': ariaLabel,
  value,
  inDefinedTermSet,
  label,
  ...props
}: OntologyButtonProps) => {
  if (!value) {
    return <></>;
  }

  return (
    <Tooltip content={ariaLabel || 'See ontology information.'}>
      <Button
        variant='outline'
        colorPalette='gray'
        fontWeight='medium'
        color='gray.800'
        {...props}
        asChild
      >
        <a href={value} target='_blank' rel='noopener noreferrer'>
          {label || inDefinedTermSet ? (
            label || inDefinedTermSet
          ) : (
            <VisuallyHidden>
              {ariaLabel || 'View the ontology for this value.'}
            </VisuallyHidden>
          )}
          <FaSitemap />
        </a>
      </Button>
    </Tooltip>
  );
};

export interface SearchButtonProps extends Omit<IconButtonProps, 'value'> {
  property: string;
  value?: string | null;
}
export const SearchButton = ({
  'aria-label': ariaLabel,
  property,
  value,
  ...props
}: SearchButtonProps) => {
  if (!value) {
    return <></>;
  }

  return (
    <Tooltip content={ariaLabel || `Search the NDE for this property value`}>
      <Button colorPalette='gray' variant='outline' px={0} {...props} asChild>
        <NextLink
          href={{
            pathname: `/search`,
            query: {
              q: `${property}:"${value}"`,
            },
          }}
        >
          <VisuallyHidden>
            {ariaLabel || `Search the NDE for this property value`}
          </VisuallyHidden>
          <Icon fontSize='xs'>
            <FaMagnifyingGlass />
          </Icon>
        </NextLink>
      </Button>
    </Tooltip>
  );
};
