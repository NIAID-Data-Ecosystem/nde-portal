import React from 'react';
import { FaApple, FaLinux, FaWindows } from 'react-icons/fa6';

export interface OperatingSystemIcon {
  os: string;
  icon: React.ReactNode;
}

export const operatingSystemIcons: OperatingSystemIcon[] = [
  { os: 'Linux', icon: <FaLinux /> },
  { os: 'Mac', icon: <FaApple /> },
  { os: 'Windows', icon: <FaWindows /> },
];
