import { IconType } from 'react-icons';
import { FaLinux, FaApple, FaWindows } from 'react-icons/fa6';

export interface OperatingSystemIcon {
  os: string;
  icon: IconType;
}

export const operatingSystemIcons: OperatingSystemIcon[] = [
  { os: 'Linux', icon: FaLinux },
  { os: 'Mac', icon: FaApple },
  { os: 'Windows', icon: FaWindows },
];
