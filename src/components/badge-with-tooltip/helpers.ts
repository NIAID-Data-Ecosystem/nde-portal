import { FaLockOpen, FaLock } from 'react-icons/fa';
import { FormattedResource } from 'src/utils/api/types';

export const getBadgeIcon = (data: Partial<FormattedResource>) => {
  if (!data) return;
  const property = Object.keys(data)[0];
  let iconType;
  let value = data[property] as FormattedResource[keyof FormattedResource];

  // let propertyValue = value as FormattedResource[property];
  if (property === 'conditionsOfAccess') {
    if (value.toLowerCase() === 'open') {
      iconType = FaLockOpen;
    } else if (
      value.toLowerCase() === 'controlled' ||
      value.toLowerCase() === 'restricted' ||
      value.toLowerCase() === 'embargoed'
    ) {
      iconType = FaLock;
    }
  }
  return iconType;
};
