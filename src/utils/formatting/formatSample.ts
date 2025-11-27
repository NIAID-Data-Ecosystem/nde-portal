export const SAMPLE_PROPERTY_LABELS: { [key: string]: { label: string } } = {
  '@type': { label: 'Type' },
  anatomicalStructure: { label: 'Anatomical Structure' },
  anatomicalSystem: { label: 'Anatomical System' },
  associatedGenotype: { label: 'Associated Genotype' },
  associatedPhenotype: { label: 'Associated Phenotype' },
  cellType: { label: 'Cell Type' },
  collectionSize: { label: 'Number of Samples' },
  developmentalStage: { label: 'Developmental Stage' },
  includedInDataCatalog: { label: 'Source' },
  sampleAvailability: { label: 'Sample Availability' },
  sampleList: { label: 'Sample List' },
  ['sampleList.identifier']: { label: 'Sample ID' },
  sampleQuantity: { label: 'Sample Quantity' },
  sampleType: { label: 'Sample Type' },
  sex: { label: 'Sex' },
};

export const formatSampleLabelFromProperty = (property: string) => {
  return SAMPLE_PROPERTY_LABELS[property]?.label || property;
};
