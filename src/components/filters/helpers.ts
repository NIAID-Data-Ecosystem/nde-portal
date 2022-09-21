export const formatFacetTerm = (term: string, facet: string) => {
  if (facet === '@type') {
    return formatType(term);
  }
  return term;
};

export const formatType = (term: string) => {
  if (term.toLowerCase() === 'computationaltool') {
    return 'Computational Tool';
  } else if (term.toLowerCase() === 'dataset') {
    return 'Dataset';
  }
  return term;
};
