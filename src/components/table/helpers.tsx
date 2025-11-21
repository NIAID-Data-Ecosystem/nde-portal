import { Icon, IconProps } from '@chakra-ui/react';
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
    // BAM file extension
    icon = ({ id }: IconProps) => (
      <Icon viewBox='0 0 200 200'>
        <title id={id}>Icon for BAM type files.</title>

        <path
          fill='currentColor'
          stroke='currentColor'
          d='M176.21,50.68H126.78V.65h2.38a9.19,9.19,0,0,1,6.51,2.72l37.85,38.31a9.2,9.2,0,0,1,2.69,6.59ZM84.38,110.85h12.3L90.58,91.7Zm-40.23.84a9.47,9.47,0,0,0-3.93-.73H30.6v12.66h9.1c2.69,0,4.66-.63,6-1.88a5.93,5.93,0,0,0,2.07-4.5,6,6,0,0,0-.93-3.35A6.27,6.27,0,0,0,44.15,111.69ZM43,100.7a5.47,5.47,0,0,0,2.17-1.15,7,7,0,0,0,1.56-1.88,5,5,0,0,0,.51-2.51,5.16,5.16,0,0,0-2.17-4.5,8.94,8.94,0,0,0-5.48-1.57h-9V101h9.62A8,8,0,0,0,43,100.7ZM200.2,76.63v62.06a5.22,5.22,0,0,1-5.17,5.24h-18.2v47.3a9.33,9.33,0,0,1-9.31,9.42H38a9.32,9.32,0,0,1-9.31-9.42v-47.3H5.37A5.16,5.16,0,0,1,.2,138.69V76.63A5.22,5.22,0,0,1,5.37,71.4H28.64V10.07A9.32,9.32,0,0,1,38,.65h77.14V53.71a9.39,9.39,0,0,0,9.31,9.42h52.43V71.4H195A5.15,5.15,0,0,1,200.2,76.63ZM60.39,118.49a22.24,22.24,0,0,0-.31-3.55,13.31,13.31,0,0,0-1.35-3.67,9.18,9.18,0,0,0-3-3.35,17.15,17.15,0,0,0-5.37-2.4c3.3-1.57,5.68-3.25,6.92-5.24a11.28,11.28,0,0,0,2-6.69c0-4.5-1.66-8.06-5.07-10.47s-8.58-3.66-15.82-3.66H18.09v53.79h21.2c7.55,0,12.93-1.15,16.24-3.56S60.49,123.62,60.39,118.49Zm55.43,14.76L96.89,79.56H84L65.14,133.25H77.66l4-11.51H99.58l3.93,11.51Zm65.66,0V79.46h-18.3l-10.45,35.48L142.39,79.46H124v53.79H136.5v-40l11.58,40h9.31l11.68-40.08v40.08Z'
          transform='translate(-0.2 -0.65)'
        />
      </Icon>
    );
  } else if (value.toLowerCase().includes('fasta')) {
    icon = ({ id }: IconProps) => (
      <Icon viewBox='0 0 200 200'>
        <title id={id}>Icon for FASTA type files.</title>

        <path
          fill='currentColor'
          stroke='currentColor'
          d='M176.63,47.62A9.2,9.2,0,0,0,173.94,41L136.09,2.72A9.19,9.19,0,0,0,129.58,0H127.2V50h49.43Zm-13.44,63.21h9.41l-4.66-14.65Zm31.64-40.08h-18.2V62.48H124.2a9.39,9.39,0,0,1-9.31-9.42V0H37.64a9.32,9.32,0,0,0-9.3,9.42V70.75H5.17A5.22,5.22,0,0,0,0,76V138a5.16,5.16,0,0,0,5.17,5.24H28.44v47.3A9.32,9.32,0,0,0,37.75,200H167.43a9.32,9.32,0,0,0,9.3-9.42v-47.3h18.1A5.22,5.22,0,0,0,200,138V76A5.22,5.22,0,0,0,194.83,70.75ZM36.09,94.92h-19v8.8H33.2v7.74H17.06v16.33H7.55V87H36.09Zm29.37,33-3-8.69H48.91l-3,8.69H36.4L50.78,87.07H60.6L75,127.89Zm45.29-5.34a14.5,14.5,0,0,1-6,4.29,22.17,22.17,0,0,1-8.69,1.57,22.73,22.73,0,0,1-6-.73,19.58,19.58,0,0,1-5.48-2.3,13.42,13.42,0,0,1-4-4,12,12,0,0,1-1.86-5.54h9.72a5.17,5.17,0,0,0,1.45,2.82,7.19,7.19,0,0,0,2.68,1.78,9.74,9.74,0,0,0,3.62.63,13.33,13.33,0,0,0,3.62-.42,5.51,5.51,0,0,0,2.69-1.47,3.16,3.16,0,0,0,1-2.61,2.72,2.72,0,0,0-.93-2.2A7.08,7.08,0,0,0,100.1,113a31.37,31.37,0,0,0-3.31-.84l-6.61-1.25a12.5,12.5,0,0,1-7.35-3.77,11.56,11.56,0,0,1-2.89-7.85A10.8,10.8,0,0,1,82,92.52a14.47,14.47,0,0,1,5.79-4.4A20.63,20.63,0,0,1,96,86.55a21.32,21.32,0,0,1,9.1,1.68,12.14,12.14,0,0,1,5.58,4.5,11.69,11.69,0,0,1,2,6.49H103.1a5.57,5.57,0,0,0-1.14-3,5.39,5.39,0,0,0-2.37-1.67A11.73,11.73,0,0,0,96.07,94a11.38,11.38,0,0,0-2.79.32,5,5,0,0,0-2,.94,3.49,3.49,0,0,0-1.13,1.36,4.38,4.38,0,0,0-.42,1.57,3.1,3.1,0,0,0,1,2.51,8.86,8.86,0,0,0,3.93,1.57l6.51,1.26a16.93,16.93,0,0,1,6.31,2.3,10.82,10.82,0,0,1,3.41,3.45,11,11,0,0,1,1.45,3.87,22.19,22.19,0,0,1,.31,3.46A8,8,0,0,1,110.75,122.55Zm28,5.34h-9.51V95.45H117.48V87h33.09v8.48H138.88v32.44Zm39,0-3-8.69H161.12l-3,8.69H148.6L163,87.07h9.82l14.38,40.82ZM51,110.83h9.31L55.64,96.18Z'
        />
      </Icon>
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
