import { useState } from 'react';
import { Box } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import {
  FieldSelect,
  useAdvancedSearchContext,
} from 'src/components/advanced-search/components/Search';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

export const FieldTag = () => {
  const { updateQueryValue, selectedFieldDetails } = useAdvancedSearchContext();

  const [selectedField, setSelectedField] = useState(
    selectedFieldDetails?.dotfield,
  );

  return (
    <Box position='relative' maxW={['unset', 'unset', '400px']} mt={[4, 2, 0]}>
      <FieldSelect
        size='sm'
        fields={Object.values(schema)}
        selectedField={selectedField || ''}
        setSelectedField={field => {
          setSelectedField(field);
          updateQueryValue({ field });
        }}
      />
    </Box>
  );
};
