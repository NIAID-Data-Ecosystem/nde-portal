export const SAMPLE_PROPERTY_LABELS: { [key: string]: { label: string } } = {
  alternateIdentifier: { label: 'Alternate Identifer' },
  anatomicalStructure: { label: 'Anatomical Structure' },
  anatomicalSystem: { label: 'Anatomical System' },
  associatedGenotype: { label: 'Associated Genotype' },
  associatedPhenotype: { label: 'Associated Phenotype' },
  cellType: { label: 'Cell Type' },
  developmentalStage: { label: 'Developmental Stage' },
  environmentalSystem: { label: 'Environmental System' },
  healthCondition: { label: 'Health Condition' },
  identifier: { label: 'Sample ID' },
  infectiousAgent: { label: 'Infectious Agent' },
  itemListElement: { label: 'Sample Collection List' },
  numberOfItems: { label: 'Number of Samples' },
  sampleAvailability: { label: 'Sample Availability' },
  sampleQuantity: { label: 'Sample Quantity' },
  sampleState: { label: 'Sample State' },
  sampleType: { label: 'Sample Type' },
  sex: { label: 'Sex' },
  species: { label: 'Species' },
};

export const formatSampleLabelFromProperty = (property: string) => {
  return SAMPLE_PROPERTY_LABELS[property]?.label || property;
};
