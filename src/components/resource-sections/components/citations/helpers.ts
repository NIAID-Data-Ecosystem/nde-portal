import { Citation } from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers';
import { uniqueId } from 'lodash';

export const extractJournalDetails = (citation: Citation) => {
  const name = citation.journalName || citation.journalNameAbbrev || '';
  const volumeNumber = citation.volumeNumber
    ? citation.volumeNumber.replace(/[,.]/g, '')
    : '';
  const issueNumber = citation.issueNumber
    ? citation.issueNumber.replace(/[,.]/g, '')
    : '';
  const pagination = citation.pagination || '';

  return {
    key: uniqueId('journal'),
    name,
    volumeNumber,
    issueNumber,
    pagination,
  };
};

export const getCitationComponents = (citation: Citation) => {
  const journal = extractJournalDetails(citation);
  const authors = formatAuthorsList2String(citation.author, ',', 3);
  const year = citation.datePublished
    ? new Date(citation.datePublished).getUTCFullYear().toString()
    : '';
  const pmid = citation.pmid ? `PubMed PMID: ${citation.pmid}` : '';
  const doi = citation.doi ? `DOI: ${citation.doi}` : '';

  return [authors, citation.name, journal, year, pmid, doi];
};
