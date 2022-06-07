import React, { useCallback } from 'react';
import { Button, Link, Tag, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import LoadingSpinner from 'src/components/loading';
import Empty from 'src/components/empty';
import { assetPrefix } from 'next.config';
import { getTableColumns } from 'src/components/table/helpers';
import Table, { Row } from 'src/components/table';
import {
  formatAuthorsList2String,
  formatCitationString,
} from 'src/utils/helpers';
import NextLink from 'next/link';
import { getTypeColor } from 'src/components/resource-sections/components/type-banner';

interface TableProps {
  isLoading: boolean;
  data?: FormattedResource[];
}

const TableData: React.FC<TableProps> = ({ isLoading, data }) => {
  const accessorFn = useCallback(v => v.sortValue, []);

  // Loading State.
  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  // Empty State.
  if (!data || data.length === 0) {
    return (
      <Empty
        message='No results found.'
        imageUrl={`${assetPrefix}/assets/empty.png`}
        imageAlt='Missing information icon.'
        alignSelf='center'
      >
        <Text>Search yielded no results, please try again.</Text>
        <Button href='#search-header' mt={4}>
          Search Again.
        </Button>
      </Empty>
    );
  }

  const column_name_config = {
    '@type': 'type',
    name: 'Name',
    author: 'Author',
    citation: 'Associated Citations',
  } as Record<keyof FormattedResource, string>;

  const columns = data && getTableColumns(data, column_name_config);
  // Format rows
  const rows = data.map(d => {
    let obj = {} as Row;

    Object.entries(d).map(([k, v]) => {
      let value = v;
      let props: { [key: string]: any } = {};
      let sortValue = v;
      // Format authors with Link
      if (k === 'author') {
        let authors = v as FormattedResource['author'];
        props.maxW = '300px';
        sortValue = formatAuthorsList2String(authors).trim();
        value = authors ? (
          <>
            {authors.map((author, i) => {
              let q = '';
              let name = '';
              if (author.name) {
                name = author.name;
                q = `author.name:"${name}"`;
              } else if (author.familyName) {
                name =
                  (author.givenName ? author.givenName : '') +
                  author.familyName;

                q = `author.familyName:"${author.familyName}"${
                  author.givenName
                    ? `+AND+author.givenName:"${author.givenName}`
                    : ''
                }
                `;
              }

              return (
                <React.Fragment key={`${name}-${i}`}>
                  <NextLink
                    href={{
                      pathname: `/search`,
                      query: { q },
                    }}
                    passHref
                  >
                    <Link mr={1}>
                      <Text key={i} fontSize='xs'>
                        {name}
                        {i === v.length - 1 ? '.' : ','}
                      </Text>
                    </Link>
                  </NextLink>
                </React.Fragment>
              );
            })}
          </>
        ) : (
          ''
        );
      }

      if (k === 'name') {
        props.minW = '300px';
        value = (
          <NextLink
            href={{
              pathname: `/resources`,
              query: { id: d.id },
            }}
            passHref
          >
            <Link mr={1} isExternal>
              {v}
            </Link>
          </NextLink>
        );
      }

      if (k === '@type') {
        value = (
          <Tag bg={getTypeColor(v)} size='sm'>
            {v}
          </Tag>
        );
      }

      if (k === 'citation') {
        let citations = v as FormattedResource['citation'];

        value = citations ? (
          <>
            {citations.map((citation, i) => {
              let citation_string = formatCitationString(citation).trim();
              sortValue = citation_string;
              return (
                <React.Fragment key={`${citation.id}-${i}`}>
                  <Text>
                    {citation_string}{' '}
                    {citation.url ? (
                      <Link href={citation.url} isExternal>
                        Available from: {citation.url}
                      </Link>
                    ) : (
                      '-'
                    )}
                  </Text>

                  <br />
                </React.Fragment>
              );
            })}
          </>
        ) : (
          ''
        );
      }

      obj[k] = {
        value,
        sortValue: sortValue,
        props: { ...props, verticalAlign: 'top', fontSize: 'sm' },
      };
    });
    return obj;
  });

  return (
    <Table
      colorScheme='secondary'
      columns={columns}
      rowData={rows}
      caption={'Files available for download.'}
      accessor={accessorFn}
    ></Table>
  );
};

export default TableData;
