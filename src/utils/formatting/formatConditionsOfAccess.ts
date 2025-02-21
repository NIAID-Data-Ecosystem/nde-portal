import { AccessTypes } from '../api/types';

/*
 Stardized conditions of access value. Feedback provided by NIAID proposes "controlled" access instead of "closed" or "restricted".
 See issue #59 for more information.
*/

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
