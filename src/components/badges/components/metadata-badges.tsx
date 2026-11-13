import { CreativeWorkStatusDatasetType } from 'src/hooks/api/types';
import { FormattedResource } from 'src/utils/api/types';
import { SHOW_RETIRED_RESOURCE_CATALOG_UI } from 'src/utils/feature-flags';

import {
  ACCESSIBLE_FOR_FREE,
  CREATIVE_WORK_STATUS,
  getConditionsOfAccessPreset,
  getHasDownloadPreset,
  HAS_API,
} from '../config';
import { BadgeWithTooltip, MetadataBadgeProps } from './badge-with-tooltip';

/**
 * One badge per resource metadata field. Each resolves its value to a preset in
 * `../config` and hands it to `BadgeWithTooltip`; the copy and coloring live
 * there, so what is left here is only the question of whether the value is
 * worth showing at all — which is the one thing that differs between them.
 */

interface AccessibleForFreeProps extends MetadataBadgeProps {
  isAccessibleForFree?: FormattedResource['isAccessibleForFree'];
  type?: FormattedResource['@type'];
}

/**
 * Whether the resource is free to access. Renders nothing unless the record
 * actually reports a boolean — an absent value is not the same as "paid".
 */
export const AccessibleForFree = ({
  isAccessibleForFree,
  type,
  ...props
}: AccessibleForFreeProps) => {
  if (typeof isAccessibleForFree !== 'boolean' || !type) {
    return null;
  }

  return (
    <BadgeWithTooltip
      preset={
        isAccessibleForFree
          ? ACCESSIBLE_FOR_FREE.free
          : ACCESSIBLE_FOR_FREE.paid
      }
      {...props}
    />
  );
};

interface ConditionsOfAccessProps extends MetadataBadgeProps {
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  type?: FormattedResource['@type'];
}

/** Open / Controlled / Registered / Embargoed / Varied access. */
export const ConditionsOfAccess = ({
  conditionsOfAccess,
  type,
  ...props
}: ConditionsOfAccessProps) => {
  if (!conditionsOfAccess || !type) {
    return null;
  }

  return (
    <BadgeWithTooltip
      preset={getConditionsOfAccessPreset(conditionsOfAccess)}
      {...props}
    />
  );
};

interface CreativeWorkStatusProps extends MetadataBadgeProps {
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  type?: FormattedResource['@type'];
}

/**
 * Lifecycle status of the resource. Statuses without an entry in
 * `CREATIVE_WORK_STATUS` render nothing. Gated behind
 * SHOW_RETIRED_RESOURCE_CATALOG_UI until the retired-resource treatment is
 * approved for production.
 */
export const CreativeWorkStatus = ({
  creativeWorkStatus,
  type,
  ...props
}: CreativeWorkStatusProps) => {
  const preset =
    CREATIVE_WORK_STATUS[creativeWorkStatus as CreativeWorkStatusDatasetType];

  if (!SHOW_RETIRED_RESOURCE_CATALOG_UI || !preset) {
    return null;
  }

  return <BadgeWithTooltip preset={preset} {...props} />;
};

interface HasAPIProps extends MetadataBadgeProps {
  hasAPI?: FormattedResource['hasAPI'];
  type?: FormattedResource['@type'];
}

/**
 * Whether the resource exposes an API. Unlike the badges above this renders for
 * a falsy value too — "API Not Available" is itself useful information — so it
 * only needs a record to attach to.
 */
export const HasAPI = ({ hasAPI, type, ...props }: HasAPIProps) => {
  if (!type) {
    return null;
  }

  return (
    <BadgeWithTooltip
      preset={hasAPI ? HAS_API.available : HAS_API.unavailable}
      {...props}
    />
  );
};

interface HasDownloadProps extends MetadataBadgeProps {
  hasDownload?: FormattedResource['hasDownload'];
  type?: FormattedResource['@type'];
}

/** How much of the resource can be downloaded. */
export const HasDownload = ({
  hasDownload,
  type,
  ...props
}: HasDownloadProps) => {
  if (!hasDownload || !type) {
    return null;
  }

  return (
    <BadgeWithTooltip preset={getHasDownloadPreset(hasDownload)} {...props} />
  );
};
