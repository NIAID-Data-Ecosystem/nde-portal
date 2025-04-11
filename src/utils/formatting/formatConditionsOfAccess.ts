import { AccessTypes, FormattedResource } from '../api/types';

/*
 Stardized conditions of access value. Feedback provided by NIAID proposes "controlled" access instead of "closed" or "restricted".
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

export const getConditionsOfAccessDescription = (
  conditionsOfAccess: AccessTypes | null,
) => {
  if (!conditionsOfAccess) {
    return '';
  }
  // Map of access types to their descriptions
  const descriptions: Record<AccessTypes, string> = {
    Open: 'Freely available.',
    Restricted: 'May include restrictions, such as on use.',
    Registered: 'Requires registration to access',
    Embargoed: 'Unpublished',
    Controlled: 'Controlled Access',
    Unknown: 'Unknown Access',
    Varied: 'Varied Access',
  };
  return descriptions?.[conditionsOfAccess] || '';
};

export const formatConditionsOfAccess = (
  access: string | null,
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
