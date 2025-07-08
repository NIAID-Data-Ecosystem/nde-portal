export interface SeoMetaFieldsProps {
  title: string; // title of the page, should be around 60 characters.
  url: string;
  description?: string; // short description of the page should be around 155 characters.
  keywords?: string; // comma-separated keywords for the page, should be around 10-15 words.
  canonical?: string; // optional override for url
}

const DEFAULT_META = {
  title: 'NIAID Data Discovery Portal',
  description:
    'Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal',
  keywords:
    'omics, data, infectious disease, epidemiology, clinical trial, immunology, bioinformatics, surveillance, search, repository',
};

// Note: This component must be wrapped in Head tags.
export const SeoMetaFields: React.FC<SeoMetaFieldsProps> = ({
  title,
  url,
  canonical,
  description = DEFAULT_META.description,
  keywords = DEFAULT_META.keywords,
}) => {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || '';
  const fullTitle =
    title === DEFAULT_META.title ? title : `${DEFAULT_META.title} | ${title}`;
  const imageUrl = `${baseURL}/assets/preview.png`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />

      <link rel='canonical' href={canonical || url} />

      {/* Open Graph */}
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={url || baseURL} />
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content={DEFAULT_META.title} />
      <meta property='og:image' content={imageUrl} />

      {/* Twitter */}
      <meta property='twitter:title' content={fullTitle} />
      <meta property='twitter:description' content={description} />
      <meta property='twitter:card' content='summary' />
      <meta property='twitter:image' content={imageUrl} />
    </>
  );
};
