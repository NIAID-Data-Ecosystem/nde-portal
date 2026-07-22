import { FormattedResource } from 'src/utils/api/types';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';

interface HasDownloadProps extends Omit<BadgeWithTooltipProps, 'value'> {
  hasAPI?: FormattedResource['hasAPI'];
  type?: FormattedResource['@type'];
  tooltipLabel?: string;
}

export const HasAPI = ({ hasAPI, type, ...props }: HasDownloadProps) => {
  if (!type) {
    return <></>;
  }

  return (
    <BadgeWithTooltip
      colorScheme={hasAPI ? 'green' : 'gray'}
      tooltipLabel={
        hasAPI
          ? 'The resource supports programmatic access to data.'
          : 'The resource does not support programmatic access to data.'
      }
      {...props}
    >
      {hasAPI ? 'API Available' : 'API Not Available'}
    </BadgeWithTooltip>
  );
};
