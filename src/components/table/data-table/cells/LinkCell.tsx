import NextLink from 'next/link';
import React from 'react';
import { Link } from 'src/components/link';

import { EmptyValue } from './EmptyValue';

const isExternalHref = (href: string) => /^(https?:)?\/\/|^www\./i.test(href);

/**
 * A link cell. Internal paths use Next's client-side navigation; anything
 * absolute opens in a new tab with the external-link icon. Falls back to the
 * URL as the label, and to plain text when there is no URL.
 */
export const LinkCell = ({
  href,
  label,
  external,
}: {
  href?: string | null;
  label?: string | null;
  /** Overrides the internal/external guess made from `href`. */
  external?: boolean;
}) => {
  const text = label || href || '';
  if (!href) return text ? <>{text}</> : <EmptyValue />;
  if (external ?? isExternalHref(href)) {
    const url = /^www\./i.test(href) ? `https://${href}` : href;
    return (
      <Link href={url} isExternal>
        {text}
      </Link>
    );
  }
  return (
    <Link asChild>
      <NextLink href={href} prefetch={false}>
        {text}
      </NextLink>
    </Link>
  );
};
