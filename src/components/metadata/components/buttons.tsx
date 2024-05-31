import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Icon,
  IconButtonProps,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { FaMagnifyingGlass, FaSitemap } from 'react-icons/fa6';
import { useRouter } from 'next/router';
import { Link } from 'src/components/link';

export const MetadataButtonGroup = ({
  children,
  ...props
}: ButtonGroupProps) => {
  return (
    <ButtonGroup size='xs' isAttached variant='outline' {...props}>
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
    <Tooltip label={ariaLabel || 'See ontology information.'}>
      {label || inDefinedTermSet ? (
        <Button
          as={Link}
          href={value}
          target='_blank'
          variant='outline'
          colorScheme='gray'
          leftIcon={<Icon as={FaSitemap} />}
          fontSize='12px'
          fontWeight='medium'
          color='gray.800'
          sx={{
            borderBottomColor: 'inherit',
            '.child-node': {
              borderBottom: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            },
            '.child-node p': { borderBottom: 'none' },
          }}
          _visited={{
            '.child-node p, .child-node svg': {
              borderBottom: 'none',
              color: 'inherit',
            },
            _hover: { borderBottomColor: 'inherit' },
          }}
        >
          <Text pt={0.25}>{label || inDefinedTermSet} </Text>
        </Button>
      ) : (
        <Button
          as='a'
          href={value}
          target='_blank'
          variant='outline'
          colorScheme='gray'
          fontSize='12px'
          px={0}
        >
          <VisuallyHidden>
            {ariaLabel || 'View the ontology for this value.'}
          </VisuallyHidden>
          <Icon as={FaSitemap} />
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
    <Tooltip label={ariaLabel || `Search the NDE for this property value`}>
      <Button
        as='a'
        cursor='pointer'
        onClick={() => {
          router.push({
            pathname: `/search`,
            query: {
              q: `${property}:"${value}"`,
            },
          });
        }}
        colorScheme='gray'
        variant='outline'
        px={0}
        {...props}
      >
        <VisuallyHidden>
          {ariaLabel || `Search the NDE for this property value`}
        </VisuallyHidden>
        <Icon as={FaMagnifyingGlass} fontSize='12px' />
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
