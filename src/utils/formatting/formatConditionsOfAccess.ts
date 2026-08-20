import { AccessTypes, FormattedResource } from '../api/types';

/*
 Standardized conditions of access value. Feedback provided by NIAID proposes "controlled" access instead of "closed" or "restricted".
 See issue #59 for more information.
*/

export const getColorScheme = (
  conditionsOfAccess: FormattedResource['conditionsOfAccess'],
) => {
  if (conditionsOfAccess?.includes('Open')) {
    return 'green';
  } else if (conditionsOfAccess?.includes('Restricted')) {
    return 'red';
  } else if (
    conditionsOfAccess?.includes('Controlled') ||
    conditionsOfAccess?.includes('Unknown') ||
    conditionsOfAccess?.includes('Registered')
  ) {
    return 'gray';
  } else if (
    conditionsOfAccess?.includes('Embargoed') ||
    conditionsOfAccess?.includes('Varied')
  ) {
    return 'orange';
  } else {
    return 'gray';
  }
};

// Descriptive text for the conditions-of-access value, keyed by access type.
// Used by the conditions-of-access UI pill tooltip and the disease chart legend.
export const getConditionsOfAccessTooltip = (
  conditionsOfAccess: AccessTypes | null,
) => {
  if (!conditionsOfAccess) {
    return '';
  }
  const tooltips: Record<AccessTypes, string> = {
    Open: 'The resource is freely available without access restrictions.',
    // "Restricted" is remapped to "Controlled" before display; both share this text.
    Restricted: 'The resource may have conditions that limit access.',
    Controlled: 'The resource may have conditions that limit access.',
    // "Closed" is remapped to "Registered" before display.
    Registered:
      'The resource requires registration or authorization to access.',
    Embargoed: 'Public access is restricted until publication.',
    Varied: 'Access to the resource varies by record.',
    Unknown: 'Conditions of access information was not found.',
  };
  return tooltips?.[conditionsOfAccess] || '';
};

export const formatConditionsOfAccess = (
  access?: string | null,
): AccessTypes | null => {
  if (!access || access === undefined) {
    return null;
  } else {
    let label = access;

    if (access === 'Closed' || access.toLowerCase().includes('closed')) {
      /*
       Group "closed" access types as "registered".
       https://github.com/NIAID-Data-Ecosystem/niaid-feedback/issues/169#issuecomment-2546339216
      */
      label = 'Registered';
    } else if (
      access === 'Restricted' ||
      access.toLowerCase().includes('restricted')
    ) {
      /*
       Group "restricted" access types as "controlled".
       https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/59
      */
      label = 'Controlled';
    }
    return (label.charAt(0).toUpperCase() + label.slice(1)) as AccessTypes;
  }
};

export const transformConditionsOfAccessLabel = (
  conditionsOfAccess: AccessTypes | null,
) => {
  if (!conditionsOfAccess) {
    return '';
  }
  return (
    conditionsOfAccess.charAt(0) +
    conditionsOfAccess.slice(1).toLowerCase() +
    ' ' +
    'Access'
  );
};
