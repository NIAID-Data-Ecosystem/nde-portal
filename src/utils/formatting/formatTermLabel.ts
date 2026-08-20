/*
 * Splits a PascalCase API term into readable words, e.g., "MolecularSequence"
 * into "Molecular Sequence".
 *
 * Used for Content Type filter's `about.name` / `exampleOfWork.about.name`
 * terms.
 */

/*
 * Requires at least two lowercase letters before the capital letter. This keeps
 * lowercase-prefixed acronyms such as "mRNAseq" and "iPSC" intact. With only
 * one lowercase letter, they would incorrectly become "M RNAseq" and "I PSC".
 * Digits are also excluded from the left side, so "3D EM Map" stays unchanged
 * instead of becoming "3 D EM Map".
 */
const CAMEL_CASE_BOUNDARY = /([a-z]{2,})([A-Z])/g;

/**
 * Formats an API term for display by splitting PascalCase words and
 * capitalizing words that are entirely lowercase.
 *
 * Words that already contain a capital letter are left unchanged. This
 * preserves acronyms such as "EM", "3D", and "DNA" instead of changing them
 * to "Em", "3d", and "Dna".
 *
 * For Content Type terms, this produces the same labels as the API's
 * `displayName`, keeping the filter panel consistent with cards and tables.
 *
 * This only detects boundaries where lowercase letters are followed by a
 * capital letter. As a result, values such as "DNASequence" are left unchanged.
 */
export const formatTermLabel = (term: string): string => {
  if (!term || typeof term !== 'string') return '';

  const spaced = term.trim().replace(CAMEL_CASE_BOUNDARY, '$1 $2');

  return spaced
    .split(' ')
    .map(word =>
      word && word === word.toLowerCase()
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(' ');
};
