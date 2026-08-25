import { Box, BoxProps, Button } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Link } from 'src/components/link';
import { getAccessResourceURL } from 'src/components/source-logo/helpers';
import { FormattedResource } from 'src/utils/api/types';

import { HeadingWithTooltip } from './heading-with-tooltip';

// Render markdown anchors with the themed Link component so credit text links
// pick up the same color/underline/visited styles as the rest of the portal.
const markdownComponents = {
  a: ({ node, href, children, ...props }: any) => (
    <Link
      href={href}
      isExternal
      wordBreak='break-word'
      textDecoration='underline'
      {...props}
    >
      {children}
    </Link>
  ),
};

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
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === 'undefined') return;

    const el = containerRef.current;

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

  return (
    <Box {...rest}>
      {/* Optional heading with tooltip */}
      {label && (
        <HeadingWithTooltip label={label} tooltipLabel={tooltipLabel || ''} />
      )}
      {/* Collapsed to select number of lines unless expanded */}
      <Box ref={containerRef} lineClamp={expanded ? undefined : noOfLines}>
        {data?.creditText ? (
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {data?.creditText}
          </ReactMarkdown>
        ) : (
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
        )}
      </Box>

      {/* Only show toggle if there's credit text AND it overflows the set noOfLines*/}
      {data?.creditText && isOverflowing && (
        <Button
          variant='plain'
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
