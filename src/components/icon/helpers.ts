// Color associated with a given metadata property
export const getMetadataColor = (property?: string) => {
  if (property?.toLowerCase() === 'availableondevice') {
    return 'blue.500';
  } else if (property?.toLowerCase() === 'license') {
    return 'blue.500';
  } else if (property?.toLowerCase() === 'usageinfo') {
    return 'blue.500';
  } else if (property?.toLowerCase() === 'softwareversion') {
    return 'cyan.700';
  } else if (property?.toLowerCase() === 'variablemeasured') {
    return 'cyan.700';
  } else if (property?.toLowerCase() === 'measurementtechnique') {
    return 'purple.600';
  } else if (property?.toLowerCase() === 'infectiousagent') {
    return 'pink.600';
  } else if (property?.toLowerCase() === 'output') {
    return 'pink.600';
  } else if (property?.toLowerCase() === 'featurelist') {
    return 'red.500';
  } else if (property?.toLowerCase() === 'healthcondition') {
    return 'red.500';
  } else if (property?.toLowerCase() === 'funding') {
    return 'orange.500';
  } else if (property?.toLowerCase() === 'softwarerequirements') {
    return 'orange.500';
  } else if (property?.toLowerCase() === 'species') {
    return 'green.500';
  } else if (property?.toLowerCase() === 'input') {
    return 'green.500';
  } else {
    return 'gray.800';
  }
};

export const getMetadataTheme = (property?: string) => {
  if (property?.toLowerCase() === 'availableondevice') {
    return 'blue';
  } else if (property?.toLowerCase() === 'license') {
    return 'blue';
  } else if (property?.toLowerCase() === 'usageinfo') {
    return 'blue';
  } else if (property?.toLowerCase() === 'softwareversion') {
    return 'cyan';
  } else if (property?.toLowerCase() === 'variablemeasured') {
    return 'cyan';
  } else if (property?.toLowerCase() === 'measurementtechnique') {
    return 'purple';
  } else if (property?.toLowerCase() === 'infectiousagent') {
    return 'pink';
  } else if (property?.toLowerCase() === 'output') {
    return 'pink';
  } else if (property?.toLowerCase() === 'featurelist') {
    return 'red';
  } else if (property?.toLowerCase() === 'healthcondition') {
    return 'red';
  } else if (property?.toLowerCase() === 'funding') {
    return 'orange';
  } else if (property?.toLowerCase() === 'softwarerequirements') {
    return 'orange';
  } else if (property?.toLowerCase() === 'input') {
    return 'green';
  } else if (property?.toLowerCase() === 'species') {
    return 'green';
  } else if (property?.toLowerCase() === 'topiccategory') {
    return 'teal';
  } else {
    return 'gray';
  }
};
