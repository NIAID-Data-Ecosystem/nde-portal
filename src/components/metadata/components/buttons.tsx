import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Icon,
  IconButtonProps,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { FaMagnifyingGlass, FaSitemap } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';

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
        asChild
      >
        <Link href={value} target='_blank' variant='unstyled'>
          {label || inDefinedTermSet ? (
            label || inDefinedTermSet
          ) : (
            <VisuallyHidden>
              {ariaLabel || 'View the ontology for this value.'}
            </VisuallyHidden>
          )}
          <FaSitemap />
        </Link>
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
  const router = useRouter();
  if (!value) {
    return <></>;
  }

  return (
    <Tooltip content={ariaLabel || `Search the NDE for this property value`}>
      <Button
        cursor='pointer'
        colorPalette='gray'
        variant='outline'
        px={0}
        {...props}
        asChild
      >
        <a
          onClick={() => {
            router.push({
              pathname: `/search`,
              query: {
                q: `${property}:"${value}"`,
              },
            });
          }}
        >
          <VisuallyHidden>
            {ariaLabel || `Search the NDE for this property value`}
          </VisuallyHidden>
          <Icon fontSize='xs'>
            <FaMagnifyingGlass />
          </Icon>
        </a>
      </Button>
    </Tooltip>
  );
};
