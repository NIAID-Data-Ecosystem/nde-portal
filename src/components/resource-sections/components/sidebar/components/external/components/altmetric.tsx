import React from 'react';
import { Flex, Link, Text } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { formatDOI } from 'src/utils/helpers';
import { HeadingWithTooltip } from './heading-with-tooltip';

export const AltmetricBadge: React.FC<{
  citation: FormattedResource['citation'];
  doi: FormattedResource['doi'];
  nctid: FormattedResource['nctid'];
}> = props => {
  const { citation, doi, nctid } = props;
  // get pmid if it exists
  const pmid = citation?.find(c => !!c.pmid);
  if (!citation && !doi && !nctid) {
    return <></>;
  }
  return (
    <Flex>
      {(doi || nctid || pmid) && (
        <Flex flexDirection='column' alignItems='center'>
          <HeadingWithTooltip
            label='Altmetric Rating'
            aria-label='Altmetic badge'
          ></HeadingWithTooltip>
          {(doi || nctid || pmid) && (
            <div
              role='link'
              aria-label={`altmetric badge for id ${doi || nctid}`}
              data-badge-popover='bottom'
              data-badge-type='donut'
              data-doi={doi && formatDOI(doi)}
              data-nct-id={nctid}
              data-pmid={pmid}
              className='altmetric-embed'
              data-link-target='blank'
            ></div>
          )}

          <Link
            mt={1}
            href={
              'https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated'
            }
            isExternal
          >
            <Text fontSize='12px'>Learn More</Text>
          </Link>
        </Flex>
      )}
    </Flex>
  );
};
