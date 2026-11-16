import React from 'react';
import { Column } from 'src/components/table';
import {
  ExpandableList,
  renderTerm,
  TermValue,
} from 'src/components/table/data-table/cells';

/*
Legacy `ResultsTable` adapter over the shared term renderer
(src/components/table/data-table/cells/TermsCell.tsx), for the Search tables
not yet on DataTable. Deleted once they migrate. Unlike the shared `TermsCell`
it returns `null` for nothing to show, so those tables stay blank there.
*/

export type CellValue = TermValue;

// Render a cell value that may be a single scalar or an array of scalars.
export const renderCellData = (props: {
  /** Unused; kept for the legacy `Table`'s `getCells` call shape. */
  column?: Column;
  data: CellValue | CellValue[];
  loading?: boolean;
  /** Read after "Show N More" (e.g. the column header). */
  toggleContext?: string;
}): React.ReactNode => {
  const cellValue = props.data;

  if (Array.isArray(cellValue)) {
    if (cellValue.length === 0) return null;
    return (
      <ExpandableList toggleContext={props.toggleContext}>
        {cellValue.map((value, idx) => renderTerm(value, idx))}
      </ExpandableList>
    );
  }

  return renderTerm(cellValue);
};
