import React from 'react';
import { Flex, Link } from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { formatDOI } from 'src/utils/helpers';
import { HeadingWithTooltip } from './heading-with-tooltip';

export const AltmetricBadge: React.FC<{
  doi: FormattedResource['doi'];
}> = ({ doi }) => {
  return (
    <Flex>
      {doi && (
        <Flex
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
        >
          <HeadingWithTooltip label='Altmetric Rating' />
          {doi && (
            <div
              role='link'
              aria-label={`altmetric badge for doi ${doi}`}
              data-badge-popover='bottom'
              data-badge-type='donut'
              data-doi={doi && formatDOI(doi)}
              className='altmetric-embed'
              data-link-target='blank'
            ></div>
          )}

          <Link
            pt={4}
            px={4}
            href={
              'https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated'
            }
            isExternal
          >
            Learn More
          </Link>
        </Flex>
      )}
    </Flex>
  );
};
