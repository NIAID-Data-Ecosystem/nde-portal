import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import {
  FieldSelect,
  useAdvancedSearchContext,
} from 'src/components/advanced-search/components/Search';

export const FieldTag = () => {
  const { updateQueryValue, selectedFieldDetails } = useAdvancedSearchContext();

  const [selectedField, setSelectedField] = useState(
    selectedFieldDetails?.property,
  );

  return (
    <Box position='relative' maxW={['unset', 'unset', '400px']} mt={[4, 2, 0]}>
      <FieldSelect
        size='sm'
        fields={MetadataFieldsConfig}
        selectedField={selectedField || ''}
        setSelectedField={field => {
          setSelectedField(field);
          updateQueryValue({ field });
        }}
      />
    </Box>
  );
};
