import Head from 'next/head';
import SITE_CONFIG from 'configs/site.config.json';
import { SiteConfig } from '../types';

export interface SeoMetaFieldsProps {
  url: string;
  title?: string; // title of the page, should be around 60 characters
  description?: string; // short description of the page should be around 155 characters
  keywords?: string | string[]; // comma-separated keywords for the page, should be around 10-15 words
  canonical?: string; // optional override for url
  preventIndexing?: boolean; // if true, adds noindex meta tags to prevent indexing - useful for 404 page
}

const siteConfig = SITE_CONFIG as SiteConfig;
// Fallback to site-level defaults only if props are missing
const siteSeoConfig = siteConfig.site.seo;

export const SeoMetaFields: React.FC<SeoMetaFieldsProps> = ({
  title: propsTitle = siteSeoConfig?.title || '',
  description = siteSeoConfig.description,
  keywords = siteSeoConfig.keywords,
  url: relativeUrl,
  canonical,
  preventIndexing = false,
}) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
  // Thumbnail image URL for Open Graph and Twitter cards
  const imageUrl = `${BASE_URL}${siteConfig.site.previewImage}`;

  // Build final title with site name if it's not already the site title
  const title =
    !siteSeoConfig.title || propsTitle === siteSeoConfig.title
      ? propsTitle
      : `${siteSeoConfig.title} | ${propsTitle}`;

  const url = relativeUrl.startsWith('/')
    ? `${BASE_URL}${relativeUrl}`
    : relativeUrl;

  // Normalize keywords to a string
  const keywords_string = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || '';

  // Warn about missing critical SEO data
  if (!title || !description) {
    console.warn(
      'SeoMetaFields: Missing critical SEO data: title or description is required.',
    );
  }

  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      {keywords_string && <meta name='keywords' content={keywords_string} />}

      {!preventIndexing && <link rel='canonical' href={canonical || url} />}

      {/* Open Graph */}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={url} />
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content={siteConfig.site.name} />
      {imageUrl && <meta property='og:image' content={imageUrl} />}

      {/* Twitter */}
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:card' content='summary_large_image' />
      {imageUrl && <meta name='twitter:image' content={imageUrl} />}

      {/* Indexing */}
      {preventIndexing && (
        <>
          <meta name='robots' content='noindex, nofollow' />
          <meta name='googlebot' content='noindex, nofollow' />
        </>
      )}
    </Head>
  );
};

// Helper function to get page SEO config with overrides
export const getPageSeoConfig = (
  pathname: string,
  overrides: Partial<SeoMetaFieldsProps> = {},
) => {
  const pageSeoConfig = siteConfig.pages?.[pathname]?.seo || {};

  return {
    url: pathname,
    ...pageSeoConfig,
    ...overrides,
  };
};
