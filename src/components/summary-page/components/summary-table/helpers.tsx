import React from 'react';
import { Link, Tag, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { Row } from 'src/components/table';
import {
  formatAuthorsList2String,
  formatCitationString,
} from 'src/utils/helpers';
import NextLink from 'next/link';
import { getTypeColor } from 'src/components/resource-sections/components/type-banner';

export const getTableRows = (data: FormattedResource[]) =>
  data.map(d => {
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
            <Link mr={1}>{v}</Link>
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
