import {
  Box,
  Heading,
  HeadingProps,
  Separator,
  Skeleton,
  SkeletonProps,
  Stack,
} from '@chakra-ui/react';
import React from 'react';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';
import { HasAPI } from 'src/components/badges/components/HasAPI';
import { HasDownload } from 'src/components/badges/components/HasDownload';
import { getMetadataDescription } from 'src/components/metadata/helpers';
import { FormattedResource } from 'src/utils/api/types';

import { AssociatedDocumentation } from './components/associated-documentation';
import { CreditText } from './components/credit-text';
import { DataAccess } from './components/data-access';
import { License } from './components/license';
import { DataUsage } from './components/usage';

interface ExternalProps extends Omit<WrapperProps, 'children'> {
  data?: FormattedResource;
}

export const ExternalAccess = ({
  data,
  loading,
  hasDivider = true,
  ...props
}: ExternalProps) => {
  return (
    <>
      {/* Source + data access info. */}
      <Wrapper
        loading={loading}
        label='Resource Access'
        hasDivider={hasDivider}
        {...props}
      >
        {(data?.isAccessibleForFree === true ||
          data?.isAccessibleForFree === false ||
          data?.conditionsOfAccess) && (
          <Stack flexWrap='wrap' flexDirection='row'>
            <AccessibleForFree
              isAccessibleForFree={data?.isAccessibleForFree}
              type={data?.['@type']}
            />
            <ConditionsOfAccess
              type={data?.['@type']}
              conditionsOfAccess={data?.conditionsOfAccess}
            />

            {data?.hasAPI !== undefined && data?.hasAPI !== null && (
              <HasAPI type={data?.['@type']} hasAPI={data?.hasAPI} />
            )}
            {data?.hasDownload && (
              <HasDownload
                type={data?.['@type']}
                hasDownload={data?.hasDownload}
              />
            )}
          </Stack>
        )}
        <DataAccess
          loading={loading}
          includedInDataCatalog={data?.includedInDataCatalog}
          url={data?.url}
          recordType={data?.['@type']}
          creativeWorkStatus={data?.creativeWorkStatus}
        />
      </Wrapper>
    </>
  );
};

export const UsageInfo = ({
  data,
  loading,
}: {
  loading: boolean;
  data?: FormattedResource;
}) => {
  return (
    <>
      <Box bg='secondary.50'>
        {/* License, usage agreement */}
        {(data?.creditText || data?.usageInfo || data?.license) && (
          <Wrapper
            loading={loading}
            label='Usage and Licensing'
            bg='secondary.50'
          >
            <>
              <DataUsage
                loading={loading}
                type={data?.['@type']}
                usageInfo={data?.usageInfo}
              />
              <License
                loading={loading}
                type={data?.['@type']}
                license={data?.license}
              />
              <CreditText
                label='Credit Text'
                data={data}
                tooltipLabel={getMetadataDescription(
                  'creditText',
                  data?.['@type'],
                )}
              />
            </>
          </Wrapper>
        )}
        {/* Reference documents and code repositories */}
        {(data?.mainEntityOfPage || data?.codeRepository) && (
          <Wrapper loading={loading} label=''>
            <AssociatedDocumentation
              loading={loading}
              type={data?.['@type']}
              mainEntityOfPage={data?.mainEntityOfPage}
              codeRepository={data?.codeRepository}
            />
          </Wrapper>
        )}
      </Box>
    </>
  );
};

interface WrapperProps extends SkeletonProps {
  label?: string;
  loading: boolean;
  children: React.ReactNode;
  headingProps?: HeadingProps;
  hasDivider?: boolean;
}

export const Wrapper = ({
  label,
  loading,
  children,
  headingProps,
  hasDivider = true,
  ...props
}: WrapperProps) => (
  <Skeleton loading={!!loading} fontSize='xs' flex={1} {...props}>
    {hasDivider && <Separator borderColor='gray.600' />}
    {label && (
      <Heading
        as='h2'
        size={{ base: 'xs', md: 'sm' }}
        px={{ base: 4, md: 6 }}
        pt={{ base: 2, md: 4 }}
        pb={{ base: 1, md: 2 }}
        fontWeight='semibold'
        letterSpacing='wide'
        {...headingProps}
      >
        {label}
      </Heading>
    )}
    <Stack
      p={{ base: 4, md: 6 }}
      pt={{ base: 2, md: label ? 0 : 6 }}
      gap={{ base: 2, md: 4 }}
      lineHeight='short'
    >
      {children}
    </Stack>
  </Skeleton>
);
