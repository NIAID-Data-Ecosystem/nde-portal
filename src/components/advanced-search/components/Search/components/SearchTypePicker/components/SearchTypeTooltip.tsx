import Tooltip from 'src/components/tooltip';

import { SearchTypesConfigProps } from '../../../search-types-config';

interface SearchTypeTooltipProps
  extends Partial<Pick<SearchTypesConfigProps, 'description' | 'example'>> {
  children: React.ReactNode;
  /** Suppress the tooltip regardless of its content. */
  disabled?: boolean;
}

/**
 * Describes a search type on hover. Renders nothing extra when there is no
 * description or example to show.
 */
export const SearchTypeTooltip = ({
  children,
  description,
  example,
  disabled,
}: SearchTypeTooltipProps) => (
  <Tooltip
    disabled={disabled || !(description || example)}
    // Examples embed newlines that need preserving.
    contentProps={{ whiteSpace: 'pre-line' }}
    content={
      <>
        {description && (
          <>
            {description}
            <br />
          </>
        )}
        {example && (
          <>
            Example
            <br />
            {example}
          </>
        )}
      </>
    }
  >
    {children}
  </Tooltip>
);
