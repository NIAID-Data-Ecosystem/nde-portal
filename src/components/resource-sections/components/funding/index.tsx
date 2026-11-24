import { Box, Heading, Text, TextProps } from '@chakra-ui/react';
import React, { useId, useMemo, useState } from 'react';
import { CollapsibleTextTrigger } from 'src/components/collapsible-text';
import {
  ColumnDef,
  DataTable,
  EmptyValue,
  LinkCell,
} from 'src/components/table/data-table';
import { TagWithUrl } from 'src/components/tag-with-url';
import { formatDate } from 'src/utils/api/helpers';
import { Funder, Funding as FundingType } from 'src/utils/api/types';

/*
The resource page's funding table (the shared DataTable; see
src/components/table/data-table/README.md).

Sizes are content widths: the cells' 2 × 16px padding comes on top. Each is the
legacy table's border-box width minus that padding (280px, and 200px for the
dates), fixed: the legacy columns overflowed the resource page's content, so
they sat at those widths.

The funders' details ("More Information") were a drawer row under each funding
row. They're now under the funders, in the Funder cell.
*/

const SHOW_MAX_FUNDER_NAMES = 5;

const fixed = (width: number) => ({ min: width, max: width });

interface FundingRow extends FundingType {
  /** The funders' names, comma-joined: what the Funder column sorts on. */
  funderName?: string;
  funders: (Funder | null | undefined)[];
  /** Whether any funder has details beyond its name and identifier. */
  hasFunderDetails: boolean;
}

const toArray = (value?: string | string[] | null) =>
  value == null ? [] : Array.isArray(value) ? value : [value];

/** The details shown under "More Information". */
const hasDetails = (funder?: Funder | null) =>
  Boolean(
    funder &&
      (toArray(funder.alternateName).length ||
        toArray(funder.class).length ||
        toArray(funder.role).length ||
        toArray(funder.parentOrganization).length ||
        funder.employee?.length),
  );

const toRow = (funding: FundingType): FundingRow => {
  const funders = Array.isArray(funding?.funder)
    ? funding.funder
    : [funding?.funder];
  return {
    ...funding,
    name: funding?.name || '',
    funderName: Array.isArray(funding?.funder)
      ? funding?.funder?.map(f => f?.name).join(', ')
      : funding?.funder?.name ?? undefined,
    funders,
    hasFunderDetails: funders.some(hasDetails),
  };
};

/** A name (linked when it has a url) and its identifier as a tag. */
const ContentWithTag = React.memo(
  ({
    url,
    label,
    identifier,
    name,
  }: {
    identifier?: string | null;
    label?: string;
    name?: string | null;
    url?: string | null;
  }) => {
    if (!url && !identifier && !name) {
      return <EmptyValue />;
    }

    const href = url
      ? url
      : // check if it's a ror identifier
      identifier?.startsWith('https://ror.org/')
      ? identifier
      : '';

    return (
      <>
        {href && !identifier ? (
          <LinkCell
            href={href}
            label={name || 'Funding Information'}
            external
          />
        ) : (
          <Text fontWeight='medium' fontStyle={!name ? 'italic' : 'normal'}>
            {name || 'No name provided'}
          </Text>
        )}

        {identifier && (
          <TagWithUrl
            colorPalette='orange'
            href={href || ''}
            label={label}
            isExternal
            mt={0.5}
          >
            {identifier}
          </TagWithUrl>
        )}
      </>
    );
  },
);

/****** Funder details ******/

// The legacy drawer's label style.
const Label = (props: TextProps) => (
  <Text color='gray.600' lineHeight='moderate' {...props} />
);

// Label and value run on as one line of text, which wraps in the narrow cell
// (side by side, a long label became a column of its own).
const DetailRow = ({ label, values }: { label: string; values: string[] }) =>
  values.length ? (
    <div>
      <Label as='dt' display='inline' fontWeight='medium'>
        {label}:
      </Label>{' '}
      <Text as='dd' display='inline'>
        {values.join(', ')}
      </Text>
    </div>
  ) : null;

const FunderDetailsContent = ({
  funders,
}: {
  funders: FundingRow['funders'];
}) => (
  <>
    <Label textTransform='uppercase' mb={2}>
      About the Funder{funders.length > 1 ? 's' : ''}
    </Label>
    {funders.map((funder, idx) => (
      <Box
        as='dl'
        key={`${funder?.identifier}-${funder?.name}-${idx}`}
        mb={2}
        lineHeight='moderate'
        wordBreak='break-word'
      >
        {funder?.name && (
          <div>
            <Label as='dt'>Funder</Label>
            <dd>
              <Text fontWeight='semibold'>{funder.name}</Text>
              {funder.alternateName && (
                <Text color='gray.600'>
                  Alternate Name:{' '}
                  {toArray(funder.alternateName).join(', ') || '-'}
                </Text>
              )}
            </dd>
          </div>
        )}
        <DetailRow label='Class' values={toArray(funder?.class)} />
        <DetailRow label='Role' values={toArray(funder?.role)} />
        <DetailRow
          label='Parent Organization'
          values={toArray(funder?.parentOrganization)}
        />
        <DetailRow
          label='Employee'
          values={(funder?.employee ?? []).flatMap(employee =>
            toArray(employee.name),
          )}
        />
      </Box>
    ))}
  </>
);

/**
 * "More Information" about the funders, under their names. The details only
 * mount once opened, as the legacy drawer's did.
 */
const FunderDetails = ({ funders }: { funders: FundingRow['funders'] }) => {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <Box mt={2}>
      <CollapsibleTextTrigger
        isOpen={open}
        aria-controls={contentId}
        onClick={() => setOpen(prev => !prev)}
      >
        {open ? 'Less Information' : 'More Information'}
      </CollapsibleTextTrigger>
      <Box id={contentId} hidden={!open} mt={2}>
        {open && <FunderDetailsContent funders={funders} />}
      </Box>
    </Box>
  );
};

/** Up to five funders, then a count of the rest, then their details. */
const FunderCell = ({ row }: { row: FundingRow }) => {
  const { funders } = row;
  return (
    <>
      {funders.slice(0, SHOW_MAX_FUNDER_NAMES).map((funder, idx) => (
        <React.Fragment key={`${funder?.identifier}-${funder?.name}-${idx}`}>
          <Box as='span' display='block' mb={funders.length > 1 ? 2 : 0}>
            <ContentWithTag
              label='Funder ID |'
              identifier={funder?.identifier}
              url={funder?.url}
              name={funder?.name}
            />
          </Box>
          {funders.length > SHOW_MAX_FUNDER_NAMES &&
            idx === SHOW_MAX_FUNDER_NAMES - 1 && (
              <Text as='span'>
                {`and ${funders.length - SHOW_MAX_FUNDER_NAMES} more... `}
              </Text>
            )}
        </React.Fragment>
      ))}
      {row.hasFunderDetails && <FunderDetails funders={funders} />}
    </>
  );
};

/****** Columns ******/

const dateColumn = (
  id: 'startDate' | 'endDate',
  header: string,
): ColumnDef<FundingRow> => ({
  id,
  header,
  type: 'date',
  sort: true,
  size: fixed(168),
  accessor: row => formatDate(row[id]),
});

export const FUNDING_COLUMNS: ColumnDef<FundingRow>[] = [
  {
    id: 'name',
    header: 'Funding Name / Identifier',
    sort: true,
    size: fixed(248),
    cell: ({ row }) =>
      row.url || row.identifier || row.name ? (
        <ContentWithTag
          label='Funding ID |'
          identifier={row.identifier}
          url={row.url}
          name={row.name}
        />
      ) : null,
  },
  {
    id: 'funderName',
    header: 'Funder',
    sort: true,
    size: fixed(248),
    cell: ({ row }) =>
      row.hasFunderDetails ||
      row.funders.some(f => f?.url || f?.identifier || f?.name) ? (
        <FunderCell row={row} />
      ) : null,
  },
  dateColumn('startDate', 'Start Date'),
  dateColumn('endDate', 'End Date'),
];

// Their order in the record is stable, and identifiers can repeat or be
// missing.
const getFundingRowId = (_: FundingRow, index: number) => String(index);

interface FundingProps {
  loading: boolean;
  data: FundingType[];
}

// Main Funding component - renders a table with funding data.
export const Funding: React.FC<FundingProps> = ({ data, loading }) => {
  const rows = useMemo(() => data.map(toRow), [data]);

  if (!loading && rows.length === 0) {
    return <Text>No funding data available.</Text>;
  }
  return (
    <>
      <Heading as='h4' fontSize='sm' mx={1} mb={4} fontWeight='semibold'>
        Grant and Funding Information
      </Heading>
      <DataTable
        label='Grant and funding information'
        data={rows}
        columns={FUNDING_COLUMNS}
        getRowId={getFundingRowId}
        pagination
        status={{ loading }}
      />
    </>
  );
};
