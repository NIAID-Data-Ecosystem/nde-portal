import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Icon,
  IconButtonProps,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FaMagnifyingGlass, FaSitemap } from 'react-icons/fa6';
import { Tooltip } from 'src/components/tooltip';

export const MetadataButtonGroup = ({
  children,
  ...props
}: ButtonGroupProps) => {
  return (
    <ButtonGroup
      size='2xs'
      attached
      variant='outline'
      cursor='pointer'
      colorPalette='gray'
      css={{
        // Override the second buttons left border radius to match the first button
        '& button:not(:first-of-type), a:not(:first-of-type)': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
      }}
      {...props}
    >
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
}: OntologyButtonProps) => {
  if (!value) {
    return <></>;
  }

  return (
    <Tooltip content={ariaLabel || 'See ontology information.'}>
      <Button asChild>
        <NextLink href={value} target='_blank'>
          <Icon as={FaSitemap} />
          {label || inDefinedTermSet ? (
            <Text pt={0.25}>{label || inDefinedTermSet} </Text>
          ) : (
            <VisuallyHidden>
              {ariaLabel || 'View the ontology for this value.'}
            </VisuallyHidden>
          )}
        </NextLink>
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
      <Button asChild px={0} {...props}>
        <NextLink
          href={{ pathname: `/search`, query: { q: `${property}:"${value}"` } }}
        >
          <VisuallyHidden>
            {ariaLabel || `Search the NDE for this property value`}
          </VisuallyHidden>
          <Icon as={FaMagnifyingGlass} />
        </NextLink>
      </Button>
    </Tooltip>
  );
};
