import { Flex } from '@chakra-ui/react';
import React from 'react';
import { Column } from 'src/components/table';
import { renderTerm, TermValue } from 'src/components/table/data-table/cells';

/*
The sample tables' cells, over the shared term renderer
(src/components/table/data-table/cells/TermsCell.tsx): strings, booleans,
DefinedTerms and QuantitativeValues. Lists show every value (no "Show More"),
and nothing to show renders nothing, as these legacy tables always have.
*/

export type CellValue = TermValue;

// Render cell data which can be a single value or an array of values.
const renderCellData = (props: {
  column: Column;
  data: CellValue | CellValue[];
  loading?: boolean;
}) => {
  const cellValue = props.data;

  if (Array.isArray(cellValue)) {
    if (cellValue.length === 0) return null;

    return (
      <Flex flexDirection='column' gap={2}>
        {cellValue.map((value, idx) => renderTerm(value, idx))}
      </Flex>
    );
  }

  return renderTerm(cellValue);
};

export const Cell = {
  renderCellData,
};
