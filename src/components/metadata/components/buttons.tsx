import {
  Button,
  ButtonGroup,
  ButtonGroupProps,
  Icon,
  IconButton,
  IconButtonProps,
  Text,
} from 'nde-design-system';
import Tooltip from 'src/components/tooltip';
import { FaSearch, FaSitemap } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { encodeString } from 'src/utils/querystring-helpers';

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
}
export const OntologyButton = ({
  'aria-label': ariaLabel,
  value,
  inDefinedTermSet,
}: OntologyButtonProps) => {
  if (!value) {
    return <></>;
  }

  return (
    <Tooltip label={ariaLabel || 'See ontology information.'}>
      {inDefinedTermSet ? (
        <Button
          as='a'
          href={value}
          target='_blank'
          variant='outline'
          colorScheme='gray'
          leftIcon={<Icon as={FaSitemap} />}
        >
          <Text
            fontSize='12px'
            fontWeight='semibold'
            lineHeight='short'
            color='inherit'
          >
            {inDefinedTermSet}
          </Text>
        </Button>
      ) : (
        <IconButton
          as='a'
          href={value}
          target='_blank'
          aria-label={ariaLabel || 'View the ontology for this value.'}
          variant='outline'
          colorScheme='gray'
          fontSize='12px'
          icon={<Icon as={FaSitemap} />}
        />
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
      <IconButton
        as='a'
        cursor='pointer'
        onClick={() => {
          router.push({
            pathname: `/search`,
            query: {
              q: `${property}:"${encodeString(value)}"`,
              advancedSearch: true,
            },
          });
        }}
        aria-label={ariaLabel || `Search the NDE for this property value`}
        colorScheme='gray'
        variant='outline'
        icon={<Icon as={FaSearch} fontSize='12px' />}
        {...props}
      />
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
