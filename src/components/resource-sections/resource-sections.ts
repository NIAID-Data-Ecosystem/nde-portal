export const RESOURCE_SECTIONS = {
  title: 'Sections',
  routes: [
    {
      title: 'Overview',
      hash: 'overview',
      properties: [
        'about',
        'availableOnDevice',
        'collectionSize',
        'doi',
        'exampleOfWork.about',
        'featureList',
        'genre',
        'healthCondition',
        'infectiousAgent',
        'inLanguage',
        'input',
        'license',
        'locationNames',
        'measurementTechnique',
        'nctid',
        'output',
        'programmingLanguage',
        'softwareHelp',
        'softwareRequirements',
        'softwareVersion',
        'spatialCoverage',
        'species',
        'temporalCoverage',
        'topicCategory',
        'variableMeasured',
      ],
      ui: {
        showInNavigation: true,
        showEmptyState: true,
      },
    },
    {
      title: 'Keywords',
      hash: 'keywords',
      properties: ['keywords'],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Application Categories',
      hash: 'applicationCategory',
      properties: ['applicationCategory'],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Programming Languages',
      hash: 'programmingLanguage',
      properties: ['programmingLanguage'],
      ui: {
        showInNavigation: true,
      },
    },

    {
      title: 'Description',
      hash: 'description',
      properties: ['description'],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Samples',
      hash: 'samples',
      properties: ['sample', 'sample.numberOfItems', 'sample.sampleQuantity'],
      ui: {
        showInNavigation: true,
        showEmptyState: false,
      },
    },
    {
      title: 'Provenance',
      hash: 'provenance',
      properties: ['includedInDataCatalog', 'url', 'sdPublisher'],
      ui: {
        showInNavigation: true,
        showEmptyState: true,
      },
    },
    {
      title: 'File Downloads',
      hash: 'downloads',
      properties: ['distribution', 'downloadUrl'],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Funding',
      hash: 'funding',
      properties: ['funding'],
      ui: {
        showInNavigation: true,
        showEmptyState: true,
      },
    },
    {
      title: 'Based On',
      hash: 'isBasedOn',
      properties: ['isBasedOn'],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Example of Work',
      hash: 'exampleOfWork',
      properties: [
        'exampleOfWork.encodingFormat',
        'exampleOfWork.schemaVersion',
        'exampleOfWork.additionalProperty',
      ],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Cited By',
      hash: 'citedBy',
      properties: ['citedBy'],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Related Resources',
      hash: 'relatedResources',
      properties: ['hasPart', 'isBasisFor', 'isRelatedTo', 'isPartOf'],
      ui: {
        showInNavigation: true,
      },
    },
    {
      title: 'Metadata',
      hash: 'metadata',
      properties: ['rawData'],
      ui: {
        showInNavigation: true,
      },
    },
  ],
};
