import {
  Box,
  BoxProps,
  FlexProps,
  Heading,
  HeadingProps,
  Skeleton,
  Text,
  TextProps,
} from '@chakra-ui/react';
import React from 'react';
import { DetailsAccordion } from 'src/components/details-accordion';

interface SectionProps extends BoxProps {
  id: string;
  name?: string;
  color?: string;
  bg?: string;
  loading?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  id,
  loading,
  name,
  children,
  color,
  bg,
  ...props
}) => {
  const Content = () => {
    return (
      <Skeleton
        loading={!!loading}
        height={loading ? '200px' : 'unset'}
        p={{ base: 0, sm: 4 }}
        {...props}
      >
        {children}
      </Skeleton>
    );
  };

  return (
    <Box as='section' id={id}>
      <DetailsAccordion
        variant='ruled'
        css={{
          '--bg-currentcolor': 'white',
        }}
        summary={
          name && (
            <Text
              fontFamily='heading'
              fontWeight='semibold'
              fontSize='md'
              color='text.heading'
              lineHeight='moderate'
            >
              {name}
            </Text>
          )
        }
        defaultValue={['details']}
      >
        <Content />
      </DetailsAccordion>
    </Box>
  );
};

export interface ContentHeaderProps extends FlexProps {
  title: string;
  subtitle?: string;
  titleProps?: HeadingProps;
  subtitleProps?: TextProps;
}

/**
 * A header for content within the section, which includes a title and subtitle.
 */
export const ContentHeader = ({
  title,
  subtitle,
  titleProps,
  subtitleProps,
}: ContentHeaderProps) => {
  return (
    <Box>
      {title && (
        <Heading as='h3' fontSize='sm' {...titleProps}>
          {title}
        </Heading>
      )}
      {subtitle && (
        <Text lineHeight='short' fontSize='sm' mt={0.5} {...subtitleProps}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
};
