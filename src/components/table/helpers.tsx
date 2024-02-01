import { IconProps } from '@chakra-ui/react';
import { Link, LinkProps } from 'src/components/link';
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
import { Column } from '.';
import { MetadataIcon } from '../icon';

// Checks if string is a valid url.
export const isValidUrl = (str: string) => {
  var regexp =
    /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(str);
};

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
    value.toLowerCase().includes('.tar') ||
    value.toLowerCase().includes('.7z') ||
    value.toLowerCase().includes('.gzip')
  ) {
    // Archived file extensions
    icon = FaFileZipper;
  } else if (
    value.toLowerCase().includes('.png') ||
    value.toLowerCase().includes('.jpeg') ||
    value.toLowerCase().includes('.svg')
  ) {
    // Image file extensions
    icon = FaFileImage;
  } else if (
    // Excel file extensions
    value.toLowerCase().includes('.xls') ||
    value.toLowerCase().includes('.xlsx')
  ) {
    icon = FaFileExcel;
    color = 'green.500';
  } else if (
    value.toLowerCase().includes('.csv') ||
    value.toLowerCase().includes('text/csv')
  ) {
    icon = FaFileCsv;
    color = 'green.600';
  } else if (
    value.toLowerCase().includes('.doc') ||
    value.toLowerCase().includes('.docx')
  ) {
    icon = FaFileWord;
    color = 'blue.500';
  } else if (
    value.toLowerCase().includes('.ppt') ||
    value.toLowerCase().includes('.pptx')
  ) {
    icon = FaFilePowerpoint;
    color = 'orange.500';
  } else if (value.toLowerCase().includes('.pdf')) {
    icon = FaFilePdf;
    color = 'red.500';
  } else if (value.toLowerCase().includes('.txt')) {
    icon = FaFileLines;
    color = 'gray.800';
  }
  return { icon, color };
};

interface CellProps extends LinkProps {
  value: any;
}
// Format table cells with links if needed
export const FormatLinkCell = ({ value, ...props }: CellProps) => {
  if (isValidUrl(value)) {
    return (
      <Link href={value} isExternal {...props}>
        {value}
      </Link>
    );
  } else {
    return <>{Array.isArray(value) ? value.join(',') : value || '-'}</>;
  }
};

// Format table columns with a config file. The [showEmptyColumns] flag decides whether columns without data should still be displayed.
export const getTableColumns = (
  data: { [key: string]: any }[],
  config: { [key: string]: string },
  showEmptyColumns: boolean = true,
): Column[] => {
  return Object.values(
    data?.reduce((r, d, i) => {
      Object.entries(d).map(([k, v]) => {
        // When showEmptyColumns is selected, we show the property even if there is associated value, otherwise we chack taht there is an associated value.
        if (config[k]) {
          if (
            (showEmptyColumns && !r[k]) ||
            (!showEmptyColumns && v && !r[k])
          ) {
            r[k] = { key: k, title: config[k] };
          }
        }
      });
      return r;
    }, {} as { [key: string]: Column }),
  );
};

export const getTruncatedText = (
  description?: string | null,
  isOpen?: boolean,
  MAX_CHARS = 144,
) => {
  if (!description) {
    return { text: '', hasMore: false };
  }

  // truncate description if it's longer than 144 chars
  const text =
    description.length < MAX_CHARS
      ? description
      : description.substring(0, isOpen ? description.length : 144);

  return { text, hasMore: description.length > MAX_CHARS };
};
