import { IconProps } from '@chakra-ui/react';
import {
  FaFileCode,
  FaFileCsv,
  FaFileExcel,
  FaFileImage,
  FaFileLines,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
  FaFileZipper,
} from 'react-icons/fa6';
import { MetadataIcon } from '../icon';

export const getFileIcon = (value: string) => {
  if (!value) {
    return { icon: null, color: null };
  }

  let icon = null;
  let color = 'inherit';

  // Add icon for different file formats
  if (
    value.toLowerCase().includes('xml') ||
    value.toLowerCase().includes('html')
  ) {
    // Code file extensions
    icon = FaFileCode;
  } else if (value.toLowerCase().includes('bam')) {
    // Archived file extensions
    icon = ({ id, ...props }: IconProps) => (
      <MetadataIcon
        id={id!}
        glyph='bam'
        title='bam file type'
        stroke='currentColor'
        {...props}
      />
    );
  } else if (value.toLowerCase().includes('fasta')) {
    // Archived file extensions
    icon = ({ id, ...props }: IconProps) => (
      <MetadataIcon
        id={id!}
        glyph='fasta'
        title='fasta file type'
        stroke='currentColor'
        {...props}
      />
    );
  } else if (
    value.toLowerCase().includes('zip') ||
    value.toLowerCase().includes('tar') ||
    value.toLowerCase().includes('7z') ||
    value.toLowerCase().includes('gzip')
  ) {
    // Archived file extensions
    icon = FaFileZipper;
  } else if (
    value.toLowerCase().includes('png') ||
    value.toLowerCase().includes('jpeg') ||
    value.toLowerCase().includes('svg')
  ) {
    // Image file extensions
    icon = FaFileImage;
  } else if (
    // Excel file extensions
    value.toLowerCase().includes('xls') ||
    value.toLowerCase().includes('xlsx')
  ) {
    icon = FaFileExcel;
    color = 'green.500';
  } else if (
    value.toLowerCase().includes('csv') ||
    value.toLowerCase().includes('text/csv')
  ) {
    icon = FaFileCsv;
    color = 'green.600';
  } else if (
    value.toLowerCase().includes('doc') ||
    value.toLowerCase().includes('docx')
  ) {
    icon = FaFileWord;
    color = 'blue.500';
  } else if (
    value.toLowerCase().includes('ppt') ||
    value.toLowerCase().includes('pptx')
  ) {
    icon = FaFilePowerpoint;
    color = 'orange.500';
  } else if (value.toLowerCase().includes('pdf')) {
    icon = FaFilePdf;
    color = 'red.500';
  } else if (value.toLowerCase().includes('txt')) {
    icon = FaFileLines;
    color = 'gray.800';
  }
  return { icon, color };
};

export const getTruncatedText = (
  description?: string | null,
  showFullDescription?: boolean,
  MAX_CHARS = 144,
) => {
  if (!description) {
    return { text: '', hasMore: false };
  }

  // truncate description if it's longer than 144 chars
  const text =
    description.length < MAX_CHARS
      ? description
      : description.substring(
          0,
          showFullDescription ? description.length : MAX_CHARS,
        );
  return {
    text,
    hasMore: showFullDescription ? false : description.length > MAX_CHARS,
  };
};
