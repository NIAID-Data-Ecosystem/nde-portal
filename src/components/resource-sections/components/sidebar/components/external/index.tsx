import React from 'react';
import { FormattedResource } from 'src/utils/api/types';
import {
  Box,
  Divider,
  Flex,
  Heading,
  HeadingProps,
  Skeleton,
  Stack,
} from 'nde-design-system';
import { DataAccess } from './components/data-access';
import { DataUsage } from './components/usage';
import { License } from './components/license';
import { AssociatedDocumentation } from './components/associated-documentation';
import { AltmetricBadge } from './components/altmetric';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';

export const External = ({
  data,
  isLoading,
}: {
  isLoading: boolean;
  data?: FormattedResource;
}) => {
  const hasAltmetricBadge = !!data?.doi;
  return (
    <>
      {/* altmetric divider */}
      {hasAltmetricBadge && (
        <Wrapper isLoading={isLoading} hasDivider={false}>
          <AltmetricBadge doi={data.doi} />
        </Wrapper>
      )}
      {/* Source + data access info. */}
      <Wrapper
        isLoading={isLoading}
        label='Data Access'
        hasDivider={hasAltmetricBadge}
      >
        {(data?.isAccessibleForFree === true ||
          data?.isAccessibleForFree === false ||
          data?.conditionsOfAccess) && (
          <Flex>
            <AccessibleForFree
              isAccessibleForFree={data?.isAccessibleForFree}
              mx={1}
            />
            <ConditionsOfAccess
              conditionsOfAccess={data?.conditionsOfAccess}
              mx={1}
            />
          </Flex>
        )}
        <DataAccess
          isLoading={isLoading}
          includedInDataCatalog={data?.includedInDataCatalog}
          url={data?.url}
        />
      </Wrapper>
      <Box bg='secondary.50'>
        {/* License, usage agreement */}
        {(data?.usageInfo || data?.license) && (
          <Wrapper isLoading={isLoading} label='Usage and Licensing'>
            <>
              <DataUsage isLoading={isLoading} usageInfo={data?.usageInfo} />
              <License isLoading={isLoading} license={data?.license} />
            </>
          </Wrapper>
        )}
        {/* Reference documents and code repositories */}
        {(data?.hasPart || data?.mainEntityOfPage || data?.codeRepository) && (
          <Wrapper isLoading={isLoading} label='Documents'>
            <AssociatedDocumentation
              isLoading={isLoading}
              hasPart={data?.hasPart}
              mainEntityOfPage={data?.mainEntityOfPage}
              codeRepository={data?.codeRepository}
            />
          </Wrapper>
        )}
      </Box>
    </>
  );
};

const Wrapper = ({
  label,
  isLoading,
  children,
  headingProps,
  hasDivider = true,
}: {
  label?: string;
  isLoading: boolean;
  children: React.ReactNode;
  headingProps?: HeadingProps;
  hasDivider?: boolean;
}) => (
  <Skeleton isLoaded={!isLoading} fontSize='xs'>
    {hasDivider && <Divider borderColor='niaid.placeholder' />}
    {label && (
      <Heading
        as='h2'
        size='sm'
        p={[4, 6]}
        pt={[4, 4]}
        pb={[2, 2]}
        fontWeight='semibold'
        letterSpacing='wide'
        {...headingProps}
      >
        {label}
      </Heading>
    )}
    <Stack p={6} pt={label ? 0 : 6} spacing={4} lineHeight='short'>
      {children}
    </Stack>
  </Skeleton>
);
