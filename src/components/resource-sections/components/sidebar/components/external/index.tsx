import React from 'react';
import { FormattedResource } from 'src/utils/api/types';
import {
  Box,
  Divider,
  Heading,
  HeadingProps,
  Skeleton,
  Stack,
} from '@chakra-ui/react';
import { DataAccess } from './components/data-access';
import { DataUsage } from './components/usage';
import { License } from './components/license';
import { AssociatedDocumentation } from './components/associated-documentation';
import { AccessibleForFree, ConditionsOfAccess } from 'src/components/badges';
import { HasDownload } from 'src/components/badges/components/HasDownload';
import { HasAPI } from 'src/components/badges/components/HasAPI';

export const External = ({
  data,
  isLoading,
  hasDivider = true,
}: {
  isLoading: boolean;
  data?: FormattedResource;
  hasDivider: boolean;
}) => {
  return (
    <>
      {/* Source + data access info. */}
      <Wrapper
        isLoading={isLoading}
        label='Resource Access'
        hasDivider={hasDivider}
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
          isLoading={isLoading}
          includedInDataCatalog={data?.includedInDataCatalog}
          url={data?.url}
          recordType={data?.['@type']}
        />
      </Wrapper>
      <Box bg='secondary.50'>
        {/* License, usage agreement */}
        {(data?.usageInfo || data?.license) && (
          <Wrapper isLoading={isLoading} label='Usage and Licensing'>
            <>
              <DataUsage
                isLoading={isLoading}
                type={data?.['@type']}
                usageInfo={data?.usageInfo}
              />
              <License
                isLoading={isLoading}
                type={data?.['@type']}
                license={data?.license}
              />
            </>
          </Wrapper>
        )}
        {/* Reference documents and code repositories */}
        {(data?.mainEntityOfPage || data?.codeRepository) && (
          <Wrapper isLoading={isLoading} label=''>
            <AssociatedDocumentation
              isLoading={isLoading}
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

export const Wrapper = ({
  label,
  isLoading,
  children,
  headingProps,
  hasDivider = true,
  ...props
}: {
  label?: string;
  isLoading: boolean;
  children: React.ReactNode;
  headingProps?: HeadingProps;
  hasDivider?: boolean;
}) => (
  <Skeleton isLoaded={!isLoading} fontSize='xs' flex={1} {...props}>
    {hasDivider && <Divider borderColor='page.placeholder' />}
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
      spacing={{ base: 2, md: 4 }}
      lineHeight='short'
    >
      {children}
    </Stack>
  </Skeleton>
);
