import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Icon,
  IconButtonProps,
  Text,
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
      {label || inDefinedTermSet ? (
        <Button
          variant='outline'
          colorPalette='gray'
          fontSize='12px'
          fontWeight='medium'
          color='gray.800'
          asChild
        >
          <Link href={value} target='_blank'>
            <Icon asChild>
              <FaSitemap />
            </Icon>
            <Text pt={0.25}>{label || inDefinedTermSet} </Text>
          </Link>
        </Button>
      ) : (
        <Button
          variant='outline'
          colorPalette='gray'
          fontSize='12px'
          px={0}
          asChild
        >
          <a href={value} target='_blank'>
            <VisuallyHidden>
              {ariaLabel || 'View the ontology for this value.'}
            </VisuallyHidden>
            <Icon asChild>
              <FaSitemap />
            </Icon>
          </a>
        </Button>
      )}
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
          <Icon fontSize='12px' asChild>
            <FaMagnifyingGlass />
          </Icon>
        </a>
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
//   value: SelectedFilterValueType;
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
