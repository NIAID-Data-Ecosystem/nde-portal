import { useState, useEffect, useRef } from 'react';
import { Box, BoxProps, Button, Text } from '@chakra-ui/react';
import { HeadingWithTooltip } from './heading-with-tooltip';
import { getAccessResourceURL } from 'src/components/source-logo/helpers';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';

interface CreditTextProps extends BoxProps {
  label?: string;
  tooltipLabel?: string;
  data?: FormattedResource;
  noOfLines?: number;
}

export const CreditText = ({
  label,
  tooltipLabel,
  data,
  noOfLines = 3,
  ...rest
}: CreditTextProps) => {
  // Whether text is expanded (full text) or collapsed (3 lines)
  const [expanded, setExpanded] = useState(false);

  // Whether the content currently overflows beyond 3 lines
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Ref to the Text element so we can measure its height
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!textRef.current) return;
    if (typeof window === 'undefined') return;

    const el = textRef.current;

    // Check whether the clamped text overflows its container
    const checkOverflow = () => {
      if (!el || expanded) return;
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    };

    checkOverflow();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        checkOverflow();
      });

      observer.observe(el);

      return () => {
        observer.disconnect();
      };
    }

    // Fallback to window resize
    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  }, [data?.creditText, expanded]);

  // Display credit text if provided, otherwise show default message with link to resource.
  const creditContent = data?.creditText || (
    <>
      Please{' '}
      <Link
        href={
          data?.includedInDataCatalog &&
          getAccessResourceURL({
            recordType: data?.['@type'],
            source: Array.isArray(data?.includedInDataCatalog)
              ? data?.includedInDataCatalog[0]
              : data?.includedInDataCatalog,
            url: data?.url,
          })
        }
        isExternal
        target='_blank'
        rel='noopener noreferrer'
      >
        access the resource
      </Link>{' '}
      for complete citation guidance.
    </>
  );

  return (
    <Box {...rest}>
      {/* Optional heading with tooltip */}
      {label && (
        <HeadingWithTooltip label={label} tooltipLabel={tooltipLabel || ''} />
      )}

      {/* Collapsed to select number of lines unless expanded */}
      <Text ref={textRef} noOfLines={expanded ? undefined : noOfLines}>
        {creditContent}
      </Text>

      {/* Only show toggle if there's credit text AND it overflows the set noOfLines*/}
      {data?.creditText && isOverflowing && (
        <Button
          variant='link'
          onClick={() => setExpanded(!expanded)}
          color='blue.500'
          mt={0}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </Box>
  );
};
