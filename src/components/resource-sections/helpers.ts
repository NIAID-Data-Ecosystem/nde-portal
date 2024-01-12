import { FormattedResource } from 'src/utils/api/types';
import {
  FaAlignLeft,
  FaClipboardList,
  FaComputer,
  FaDatabase,
  FaDownload,
  FaIndent,
  FaMagnifyingGlassDollar,
  FaRegFile,
} from 'react-icons/fa6';

export interface Route {
  title: string;
  hash: string;
  metadataProperties: (keyof FormattedResource)[];
  showEmpty?: boolean;
  isCollapsible?: boolean;
}

// Helper function determines whether to show section in nav based on availability of metadata.
export const showSection = (section: Route, data?: FormattedResource) => {
  if (!section || !section.metadataProperties) {
    return false;
  }
  // filter out properties where values don't exist in data.
  const isEmpty =
    data &&
    section?.metadataProperties.filter(prop => {
      return !!data[prop] && data[prop] !== null;
    }).length === 0;

  // only show properties that are not empty unless we want that section to display while empty
  return !isEmpty || (isEmpty && section.showEmpty);
};

// Display icon for each section
export const getSectionIcon = (sectionId: string) => {
  let icon;
  if (sectionId === 'description') {
    icon = FaAlignLeft;
  } else if (sectionId === 'metadata') {
    icon = FaRegFile;
  } else if (sectionId === 'provenance') {
    icon = FaDatabase;
  } else if (sectionId === 'downloads') {
    icon = FaDownload;
  } else if (sectionId === 'funding') {
    icon = FaMagnifyingGlassDollar;
  } else if (sectionId === 'citedBy') {
    icon = FaIndent;
  } else if (sectionId === 'isBasedOn') {
    icon = FaClipboardList;
  } else if (sectionId === 'softwareInformation') {
    icon = FaComputer;
  }
  return icon;
};
