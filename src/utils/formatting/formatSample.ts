export const SAMPLE_PROPERTY_LABELS: { [key: string]: { label: string } } = {
  anatomicalStructure: { label: 'Anatomical Structure' },
  associatedGenotype: { label: 'Associated Genotype' },
  associatedPhenotype: { label: 'Associated Phenotype' },
  cellType: { label: 'Cell Type' },
  developmentalStage: { label: 'Developmental Stage' },
  numberOfItems: { label: 'Number of Samples' },
  sampleAvailability: { label: 'Sample Availability' },
  itemListElement: { label: 'Sample List' },
  ['itemListElement.identifier']: { label: 'Sample ID' },
  sampleQuantity: { label: 'Sample Quantity' },
  sampleType: { label: 'Sample Type' },
  sex: { label: 'Sex' },
};

export const formatSampleLabelFromProperty = (property: string) => {
  return SAMPLE_PROPERTY_LABELS[property]?.label || property;
};
