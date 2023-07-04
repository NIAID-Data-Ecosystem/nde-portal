import { FormattedResource } from 'src/utils/api/types';
import { VscJson } from 'react-icons/vsc';
import { GrTextAlignFull } from 'react-icons/gr';
import {
  FaDatabase,
  FaDownload,
  FaSearchDollar,
  FaThList,
  FaTools,
} from 'react-icons/fa';
import { BsBlockquoteLeft } from 'react-icons/bs';

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
    icon = GrTextAlignFull;
  }
  if (sectionId === 'metadata') {
    icon = VscJson;
  }
  if (sectionId === 'provenance') {
    icon = FaDatabase;
  }
  if (sectionId === 'downloads') {
    icon = FaDownload;
  }
  if (sectionId === 'funding') {
    icon = FaSearchDollar;
  }
  if (sectionId === 'citedBy') {
    icon = BsBlockquoteLeft;
  }
  if (sectionId === 'isBasedOn') {
    icon = FaThList;
  }
  if (sectionId === 'softwareInformation') {
    icon = FaTools;
  }
  return icon;
};
