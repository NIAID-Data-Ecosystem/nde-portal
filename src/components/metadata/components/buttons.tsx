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
    <ButtonGroup size='xs' attached variant='outline' {...props}>
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
      <Button asChild variant='outline' size='2xs' colorPalette='gray'>
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
  const router = useRouter();
  if (!value) {
    return <></>;
  }

  return (
    <Tooltip content={ariaLabel || `Search the NDE for this property value`}>
      <Button
        asChild
        cursor='pointer'
        colorPalette='gray'
        variant='outline'
        px={0}
        {...props}
      >
        <NextLink
          href={{ pathname: `/search`, query: { q: `${property}:"${value}"` } }}
        >
          <VisuallyHidden>
            {ariaLabel || `Search the NDE for this property value`}
          </VisuallyHidden>
          <Icon as={FaMagnifyingGlass} fontSize='12px' />
        </NextLink>
      </Button>
    </Tooltip>
  );
};

// FilterByButton is used to filter the current results by a specific property and value
// export const FilterByButton = ({
//   property,
//   value,
//   children,
// }: {
//   property: string;
//   value: SelectedFilterTypeValue;
//   children: React.ReactNode;
// }) => {
//   const router = useRouter();
//   const { filters } = router.query;
//   const selectedFilters = queryFilterString2Object(filters) || [];
//   return (
//     <Flex
//       alignItems='center'
//       _hover={{
//         cursor: 'pointer',
//         textDecoration: 'underline',
//         svg: { opacity: 1 },
//       }}
//       onClick={() => {
//         if (value) {
//           if (selectedFilters[property]) {
//             if (!selectedFilters[property].includes(value)) {
//               selectedFilters[property].push(value);
//             }
//           } else {
//             selectedFilters[property] = [value];
//           }
//         }
//         updateRoute(
//           {
//             from: 1,
//             filters: queryFilterObject2String(selectedFilters),
//           },
//           router,
//         );
//       }}
//     >
//       {children}
//       <Icon as={FaFilter} boxSize={3} mx={1} color='gray.600' opacity={0} />
//     </Flex>
//   );
// };
