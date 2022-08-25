// Color associated with a given metadata property
export const getMetadataColor = (property?: string) => {
  if (property?.toLowerCase() === 'license') {
    return 'blue.500';
  } else if (property?.toLowerCase() === 'usageinfo') {
    return 'blue.500';
  } else if (property?.toLowerCase() === 'variablemeasured') {
    return 'cyan.700';
  } else if (property?.toLowerCase() === 'measurementtechnique') {
    return 'purple.600';
  } else if (property?.toLowerCase() === 'infectiousagent') {
    return 'pink.600';
  } else if (property?.toLowerCase() === 'healthcondition') {
    return 'red.500';
  } else if (property?.toLowerCase() === 'funding') {
    return 'tomato';
  } else if (property?.toLowerCase() === 'species') {
    return 'green.500';
  } else {
    return 'gray.700';
  }
};
