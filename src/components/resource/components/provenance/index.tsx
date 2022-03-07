import React from 'react';
import {
  StyledSectionHead,
  StyledSectionHeading,
} from 'src/components/resource/styles';
import {Box, Image, Link, Text} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {Skeleton} from '@chakra-ui/skeleton';
import Stat from '../stat';

interface Provenance {
  isLoading: boolean;
  curatedBy?: FormattedResource['curatedBy'];
}

const Provenance: React.FC<Provenance> = ({curatedBy, isLoading}) => {
  return (
    <>
      <StyledSectionHead>
        <StyledSectionHeading>Provenance</StyledSectionHeading>
      </StyledSectionHead>
      <Box p={4}>
        <Skeleton isLoaded={!isLoading} p={4}>
          <Box>
            {curatedBy?.image && (
              <Image src={curatedBy.image} alt='Data source logo' />
            )}

            {curatedBy?.name && (
              <Stat isLoading={isLoading} label={`Organization's name`}>
                {curatedBy.url ? (
                  <Link href={curatedBy.url} target='_blank' isExternal>
                    {curatedBy.name}
                  </Link>
                ) : (
                  <Text>{curatedBy.name}</Text>
                )}
              </Stat>
            )}

            {curatedBy?.versionDate && (
              <Stat
                isLoading={isLoading}
                label='Version Date'
                value={new Date(curatedBy.versionDate).toLocaleString()}
              ></Stat>
            )}
          </Box>
        </Skeleton>
      </Box>
    </>
  );
};

export default Provenance;
