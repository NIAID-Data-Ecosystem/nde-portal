import { useState } from 'react';
import { Box } from 'nde-design-system';
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
    <Box position='relative'>
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
