import React from 'react';
import { Flex } from '@chakra-ui/react';
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
          <Flex alignItems='center' justifyContent='center' w='96px' h='96px'>
            {doi && (
              <div
                style={{ transform: 'scale(0.7)' }}
                className='altmetric-embed'
                role='link'
                aria-label={`altmetric badge for doi ${doi}`}
                data-badge-popover='bottom'
                data-badge-type='medium-donut'
                data-doi={doi && formatDOI(doi)}
                data-link-target='blank'
              ></div>
            )}
          </Flex>
          <HeadingWithTooltip
            label='Altmetric Rating'
            pt={2}
            tooltipLabel='Score attributed to dataset based on relevant online attention.'
            whiteSpace='nowrap'
          ></HeadingWithTooltip>
          {/* <Flex alignItems='center' pt={2}>
            <Link
              px={2}
              fontSize='xs'
              href={
                'https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated'
              }
              isExternal
              whiteSpace='nowrap'
              lineHeight='short'
            >
              Altmetric Rating
            </Link>
          </Flex> */}
        </Flex>
      )}
    </Flex>
  );
};
