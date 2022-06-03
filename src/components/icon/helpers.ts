// Color associated with a given metadata property
export const getMetadataColor = (property?: string) => {
  if (property?.toLowerCase() === 'license') {
    return 'blue.500';
  } else if (property?.toLowerCase() === 'variablemeasured') {
    return 'cyan.700';
  } else if (property?.toLowerCase() === 'measurementtechnique') {
    return 'purple.700';
  } else if (property?.toLowerCase() === 'infectiousagent') {
    return 'pink.500';
  } else if (property?.toLowerCase() === 'infectiousdisease') {
    return 'red.600';
  } else if (property?.toLowerCase() === 'funding') {
    return 'tomato';
  } else if (property?.toLowerCase() === 'species') {
    return 'green.500';
  } else {
    return 'gray.700';
  }
};

// Color associated with a given metadata property
export const getMetadataLabel = (property: string) => {
  if (property.toLowerCase().replace(/\s/g, '') === 'license') {
    return 'License';
  } else if (property.toLowerCase().replace(/\s/g, '') === 'variablemeasured') {
    return 'Variable Measured';
  } else if (
    property.toLowerCase().replace(/\s/g, '') === 'measurementtechnique'
  ) {
    return 'Measurement Technique';
  } else if (property.toLowerCase().replace(/\s/g, '') === 'infectiousagent') {
    return 'Pathogen';
  } else if (
    property.toLowerCase().replace(/\s/g, '') === 'infectiousdisease'
  ) {
    return 'Infectious Disease';
  } else if (property.toLowerCase().replace(/\s/g, '') === 'funding') {
    return 'Funding';
  } else if (property.toLowerCase().replace(/\s/g, '') === 'species') {
    return 'Species';
  } else {
    return '';
  }
};
