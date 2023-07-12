export const mockRepositoriesMetadata = {
  biothing_type: 'dataset',
  build_date: '2023-04-11T10:08:16.075127-07:00',
  build_version: '20230411',
  src: {
    lincs: {
      sourceInfo: {
        schema: {
          assayoverview: 'description',
          centerurl: 'author.url',
          biologicalprocess: 'keywords',
          description: 'description',
          principalinvestigator: 'author.name',
          datemodified: 'dateUpdated',
          datasetgroup: 'isRelatedTo',
          assayformat: 'measurementTechnique',
          protein: 'keywords',
          screeninglabinvestigator: 'author.name',
          datasetname: 'name',
          datereleased: 'datePublished',
          biologicalbucket: 'keywords',
          assayname: 'measurementTechnique',
          centerdatasetid: 'url',
          funding: 'funding',
          physicaldetection: 'variableMeasured',
          endpointcategorization: 'keywords',
          centerfullname: 'author.affiliation',
          tool: 'isBasedOn',
          technologies: 'keywords',
          size: 'distribution.contentSize',
          toollink: 'isBasedOn',
          datasetid: 'identifier',
          assaydesignmethod: 'keywords',
        },
        identifier: 'LINCS',
        name: 'BD2K-LINCS DCIC',
        description:
          'The BD2K-LINCS DCIC is comprised of four major components: Integrated Knowledge Environment (IKE), Data Science Research (DSR), Community Training and Outreach (CTO) and Consortium Coordination and Administration (CCA). The Center is constructing a high-capacity scalable integrated knowledge environment enabling federated access, intuitive querying and integrative analysis and visualization across all LINCS resources and many additional external data types from other relevant resources. The Center’s data science research projects are aimed at addressing various data integration and intracellular molecular regulatory network challenges. The Center aims to develop: 1) methods to connect cellular and organismal phenotypes with molecular cellular signatures, and 2) novel data visualization methods for dynamically interacting with large-genomics and proteomics datasets.',
        url: 'https://lincsportal.ccs.miami.edu/',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/lincs/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: 'fa03830',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/fa038303fe2fbcc9f639eee3f725345da2334f3e/biothings-hub/files/nde-hub/hub/dataload/sources/lincs/uploader.py',
      },
      stats: {
        lincs: 424,
      },
      download_date: '2023-04-05T20:16:41.384000',
      version: '2023-02-03T21:54:05Z',
      upload_date: '2023-04-05T20:16:54.051000',
    },
    dde: {
      license: 'Creative Commons Attribution 4.0 International',
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/dde/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '43948b9',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/43948b99c2700a034c4b661ca60d83239133b8f8/biothings-hub/files/nde-hub/hub/dataload/sources/dde/uploader.py',
      },
      stats: {
        dde: 396,
      },
      download_date: '2023-04-08T12:02:27.730000',
      version: '2023-04-08T01:00:04Z',
      url: 'https://discovery.biothings.io/api/dataset/',
      license_url: 'https://creativecommons.org/licenses/by/4.0/',
      upload_date: '2023-04-11T17:07:14.814000',
      sourceInfo: {
        name: 'Data Discovery Engine',
        description:
          "The Data Discovery Engine is a streamlined process to create, distribute and harves findable metadata via interoperable Schema.org schemas. The biomedical and informatics communities have largely endorsed the spirit and basic components of the FAIR Data Principles. Biomedical data producers, including CTSA hubs, need actionable best-practice guidance on how to make their data discoverable and reusable, and bring the practical benefits of data sharing to researcher's own research projects, as well as the research community as a whole.",
        schema: {
          creator: 'author',
          _id: 'identifier',
          date_created: 'dateCreated',
          last_updated: 'dateModifed',
          '@type': '@type',
          measurementTechnique: 'measurementTechnique',
          infectiousAgent: 'infectiousAgent',
          infectiousDisease: 'infectiousDisease',
          species: 'species',
        },
        url: 'https://discovery.biothings.io/',
        identifier: 'Data Discovery Engine',
      },
    },
    zenodo: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/zenodo/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '225a285',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/225a28591f42164edbad57cded38ddfdfd52bdcf/biothings-hub/files/nde-hub/hub/dataload/sources/zenodo/uploader.py',
      },
      stats: {
        zenodo: 3004141,
      },
      download_date: '2023-04-05T20:26:36.253000',
      version: '2023-01-01T00:00:24Z',
      upload_date: '2023-04-05T20:35:24.592000',
      sourceInfo: {
        name: 'Zenodo',
        description:
          'The OpenAIRE project, in the vanguard of the open access and open data movements in Europe was commissioned by the EC to support their nascent Open Data policy by providing a catch-all repository for EC funded research. CERN, an OpenAIRE partner and pioneer in open source, open access and open data, provided this capability and Zenodo was launched in May 2013.',
        schema: {
          title: 'name',
          header: 'dateModifed, url',
          description: 'description',
          date: 'datePublished',
          language: 'inLanguage.name',
          subject: 'keywords',
          relatedIdentifier: 'topicCategory',
          'xml[DOI]': 'doi',
          'xml[resourceTypeGeneral]': '@type',
          'xml[creator][creatorName]': 'author.name',
          'xml[creator][affiliation]': 'author.affiliation',
          'xml[creator][nameIdentifier]': 'author.identifier',
          'xml[rights]': 'conditionsOfAccess, license',
          'xml[relatedIdentifier][relationType]': 'citedBy',
          'xml[contributor][contributorName]': 'funding.funder.name',
        },
        url: 'https://zenodo.org/',
        identifier: 'Zenodo',
      },
    },
    ncbi_sra: {
      sourceInfo: {
        schema: {
          study_title: 'name',
          contact_name: 'author',
          Updated: 'dateModified',
          AWS_url: 'contentUrl',
          Accession: 'url',
          GCP_free_egress: 'isAccessibleForFree',
          GCP_url: 'contentUrl',
          sample_accession: 'isBasedOn.identifier',
          experiment_accession: 'isBasedOn.identifier',
          instrument: 'isBasedOn.identifier',
          'HapMap sample ID': 'isBasedOn.identifier',
          run_accession: 'isBasedOn.identifier',
          ReplacedBy: 'sameAs',
          study_abstract: 'description',
          Recieved: 'dateCreated',
          AWS_free_egress: 'isAccessibleForFree',
          Published: 'datePublished',
          organism_taxid: 'species.identifier',
          organism_name: 'species.name',
          Visibility: 'conditionsOfAccess',
          BioProject: 'isBasedOn.identifier',
          'cell line': 'isBasedOn.identifier',
        },
        identifier: 'NCBI SRA',
        name: 'NCBI SRA',
        description:
          'Sequence Read Archive(SRA) data, available through multiple cloud providers and NCBI servers, is the largest publicly available repository of high throughput sequencing data. The archive accepts data from all branches of life as well as metagenomic and environmental surveys. SRA stores raw sequencing data and alignment information to enhance reproducibility and facilitate new discoveries through data analysis.',
        url: 'https://www.ncbi.nlm.nih.gov/sra',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_sra/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '809b9bc',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/809b9bc1cea31a07092a10e909d5eb11c67b17e9/biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_sra/uploader.py',
      },
      stats: {
        ncbi_sra: 339001,
      },
      download_date: '2023-04-05T20:20:47.067000',
      version: '2023-02-01T02:26:21Z',
      upload_date: '2023-04-05T20:20:50.066000',
    },
    acd_niaid: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/acd_niaid/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '5b6567c',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/5b6567c825f0272dc894ea2d1df3d5bbc26c2e17/biothings-hub/files/nde-hub/hub/dataload/sources/acd_niaid/uploader.py',
      },
      stats: {
        acd_niaid: 6,
      },
      download_date: '2023-04-08T00:02:26.920000',
      version: '2023-04-08T00:00:06Z',
      upload_date: '2023-04-08T00:02:26.971000',
      sourceInfo: {
        name: 'AccessClinicalData@NIAID',
        description:
          'AccessClinicalData@NIAID is a NIAID cloud-based, secure data platform that enables sharing of and access to reports and data sets from NIAID COVID-19 and other sponsored clinical trials for the basic and clinical research community.',
        schema: {
          title: 'name',
          cmc_unique_id: 'identifier',
          brief_summary: 'description',
          data_availability_date: 'datePublished',
          most_recent_update: 'dateModified',
          data_available: 'additionalType',
          creator: 'funding.funder.name',
          nct_number: 'nctid, identifier',
          condition: 'healthCondition',
          clinical_trial_website: 'mainEntityOfPage',
          publications: 'citation',
          data_available_for_request: 'conditionsOfAccess',
        },
        url: 'https://accessclinicaldata.niaid.nih.gov/',
        identifier: 'AccessClinicalData@NIAID',
      },
    },
    immport: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/immport/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '43948b9',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/43948b99c2700a034c4b661ca60d83239133b8f8/biothings-hub/files/nde-hub/hub/dataload/sources/immport/uploader.py',
      },
      stats: {
        immport: 663,
      },
      download_date: '2023-04-09T12:02:33.031000',
      version: '2023-04-09T00:00:05Z',
      url: 'https://www.immport.org/shared/home',
      license_url: 'https://docs.immport.org/home/agreement/',
      upload_date: '2023-04-11T17:07:22.119000',
      sourceInfo: {
        name: 'Immunology Database and Analysis Portal (ImmPort)',
        description:
          'The ImmPort project provides advanced information technology support in the archiving and exchange of scientific data for the diverse community of life science researchers supported by NIAID/DAIT and serves as a long-term, sustainable archive of research and clinical data. The core component of ImmPort is an extensive data warehouse containing experimental data and metadata describing the purpose of the study and the methods of data generation. The functionality of ImmPort will be expanded continuously over the life of the BISC project to accommodate the needs of expanding research communities. The shared research and clinical data, as well as the analytical tools in ImmPort are available to any researcher after registration.',
        schema: {
          _id: 'identifer',
          creator: 'author',
          citations: 'citedBy',
          identifers: 'identifer',
          species: 'species',
          measurementTechnique: 'measurementTechnique',
          distribution: 'distribution',
          includedInDataCatalog: 'includedInDataCatalog',
          date: 'date',
        },
        url: 'https://www.immport.org/shared/home',
        identifier: 'ImmPort',
      },
    },
    omicsdi: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/omics_di/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '5b6567c',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/5b6567c825f0272dc894ea2d1df3d5bbc26c2e17/biothings-hub/files/nde-hub/hub/dataload/sources/omics_di/uploader.py',
      },
      stats: {
        omicsdi: 1872725,
      },
      download_date: '2023-04-05T20:20:24.970000',
      version: '2023-01-01T00:00:46Z',
      url: 'https://www.omicsdi.org/search',
      license_url: 'https://www.ebi.ac.uk/licencing',
      upload_date: '2023-04-05T20:35:41.744000',
      sourceInfo: {
        name: 'Omics Discovery Index (OmicsDI)',
        description:
          'The Omics Discovery Index (OmicsDI) provides a knowledge discovery framework across heterogeneous omics data (genomics, proteomics, transcriptomics and metabolomics).',
        schema: {
          _id: 'identifer',
          citation: 'citation',
          creator: 'author',
          description: 'description',
          distribution: 'distribution',
          keywords: 'keywords',
          name: 'name',
          sameAs: 'sameAs',
          variableMeasured: 'variableMeasured',
        },
        url: 'https://www.omicsdi.org/',
        identifier: 'Omics Discovery Index (OmicsDI)',
      },
    },
    veupathdb: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/veupathdb/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '43948b9',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/43948b99c2700a034c4b661ca60d83239133b8f8/biothings-hub/files/nde-hub/hub/dataload/sources/veupathdb/uploader.py',
      },
      stats: {
        veupathdb: 2918,
      },
      download_date: '2023-04-08T12:02:27.756000',
      version: '2023-04-08T02:00:09Z',
      upload_date: '2023-04-11T17:07:25.846000',
      sourceInfo: {
        name: 'VEuPathDB',
        description:
          'The Eukaryotic Pathogen, Vector and Host Informatics Resource(VEuPathDB) is one of two Bioinformatics Resource Centers(BRCs) funded by the US National Institute of Allergy and Infectious Diseases(NIAID), with additional support from the Wellcome Trust(UK). VEuPathDB provides access to diverse genomic and other large scale datasets related to eukaryotic pathogens and invertebrate vectors of disease. Organisms supported by this resource include (but are not limited to) the NIAID list of emerging and re-emerging infectious diseases.',
        schema: {
          id: 'identifer',
          displayName: 'name',
          contact_name: 'author',
          summary: 'description',
          type: 'measurementTechnique',
          sdPublisher: 'project_id',
          short_attribution: 'creditText',
          release_policy: 'conditionOfAccess',
          version: 'dateModified',
          author: 'affiliation',
          GenomeHistory: 'dateUpdated',
          Version: 'datePublished',
          organism: 'species',
          HyperLinks: 'distribution',
          gene_count: 'variableMeasured',
          gene_type: 'GeneTypeCounts',
        },
        url: 'https://veupathdb.org/veupathdb/app/',
        identifier: 'VEuPathDB',
      },
    },
    vivli: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/vivli/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '43948b9',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/43948b99c2700a034c4b661ca60d83239133b8f8/biothings-hub/files/nde-hub/hub/dataload/sources/vivli/uploader.py',
      },
      stats: {
        vivli: 6659,
      },
      download_date: '2023-04-11T12:02:26.609000',
      version: '2023-04-11T00:00:04Z',
      url: 'https://search.vivli.org/',
      license_url: 'https://vivli.org/resources/vivli-data-use-agreement/',
      upload_date: '2023-04-11T17:07:30.740000',
      sourceInfo: {
        name: 'Vivli',
        description:
          'Vivli is an independent non-profit organization launched in 2016. Vivli evolved from a project of The Multi-Regional Clinical Trials Center of Brigham and Women’s Hospital and Harvard(MRCT Center) to enhance access to clinical trials data by promoting data sharing and transparency. In 2013, the MRCT Center and a diverse group of global stakeholders embarked on a mission to define, design, and launch an innovative platform solution for global clinical trial data sharing. The Vivli platform provides access to anonymized individual participant-level data(IPD) or the raw data that is collected during a clinical trial. The clinical trials represented in Vivli are global and contributed by a diverse group of data contributors. By serving as a global trusted platform, Vivli increases the discoverability of available data in the wider research ecosystem, and increases the overall capacity worldwide for effective data sharing, aggregation, re-use, and novel analysis of valuable clinical research data to advance science and improve public health. The Vivli platform is a cloud-based platform that consists of a dynamic search engine, a data repository, and a secure research environment.',
        schema: {
          nctId: 'identifer',
          secondaryIds: 'identifier',
          registryInfo: 'sdPublishers',
          principalInvestigator: 'author',
          studyTitle: 'name',
          leadSponsor: 'funding',
          collaborators: 'funding',
          studyStartDate: 'temporalInterval.startDate',
          actualStudyCompletionDate: 'temporalInterval.endDate',
          locationsOfStudySites: 'spatialCoverage',
          phase: 'keywords',
          studyType: 'keywords',
          conditions: 'healthCondition.name',
          outcomeNames: 'variable_measured',
          digitalObjectId: 'doi',
          studyMetadataDoi: 'doi',
          extractedBriefSummary: 'description',
          draftCreatedDate: 'dateCreated',
          postedDate: 'datePublished',
          updatedDate: 'dateModified',
        },
        url: 'https://vivli.org/',
        identifier: 'Vivli',
      },
    },
    hubmap: {
      sourceInfo: {
        schema: {
          anatomy_1: 'keywords',
          anatomy_0: 'keywords',
          anatomy_2: 'keywords',
          'contributors.affiliation': 'author.affiliation',
          last_modified_timestamp: 'dateModified',
          dataset_info: 'measurementTechnique.description',
          'contacts.middle_name_or_initial': 'author.givenName',
          'contacts.name': 'author.name',
          'file.description': 'distribution.name',
          title: 'description',
          uuid: 'url',
          'contacts.orcid_id': 'author.identifier',
          'file.mapped_description': 'distribution.description',
          display_subtype: 'keywords',
          'file.rel_path': 'distribution.contentUrl',
          'metadata.protocols_io_doi': 'isBasedOn.doi',
          'contributors.orcid_id': 'author.identifier',
          published_timestamp: 'datePublished',
          'metadata.dag_provenance_list': 'isBasedOn.name',
          doi_url: 'doi',
          'contributors.middle_name_or_initial': 'author.givenName',
          created_timestamp: 'dateCreated',
          'contributors.first_name': 'author.givenName',
          'file.size': 'distribution.contentSize',
          version: 'version',
          'contributors.name': 'author.name',
          'contacts.last_name': 'author.familyName',
          data_access_level: 'isAccessibleForFree',
          'file.type': 'distribution.encodingFormat',
          hubmap_id: 'name',
          'contacts.first_name': 'author.givenName',
          'contacts.affiliation': 'author.affiliation',
          'contributors.last_name': 'author.familyName',
          data_types: 'measurementTechnique.name',
        },
        identifier: 'HuBMAP',
        name: 'HuBMAP',
        description:
          'HuBMAP is part of a rich ecosystem of established and emerging atlasing programs supported by NIH and globally by other funding organizations, many of which are focused on specific organs or diseases. HuBMAP has connected with these programs to ensure data interoperability, avoid duplication of work, and leverage and synergize gained knowledge. The consortium has organized a number of events to bring together these communities to discuss topics of shared interest and is committed to improving coordination and collaboration among different programs. In addition, many of the HuBMAP PIs had been or are still actively participating in these efforts, helping with cross-pollination and advancing our global understanding. HuBMAP, as its name implies, was specifically initiated to resolve the challenge of building integrated, comprehensive, high-resolution spatial maps of human tissues and organs, which has resulted in HuBMAP providing leadership in the ecosystem around techniques for integrating disparate, multi-dimensional and multi-scale datasets, the development of a Common Coordinate Framework (CCF) for integrating data across many individuals, and the development and validation of these assays. To further increase interoperability, HuBMAP has adopted a number of standards and processes developed by other domain expert consortia, working and is actively involved in the knowledge exchange. The consortium sees itself as an integral part of the ecosystem, sharing its strengths and actively contributing to the community.',
        url: 'https://hubmapconsortium.org/',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/hubmap/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '85fbc99',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/85fbc99e8478bdc327e19526de36a9424ac18055/biothings-hub/files/nde-hub/hub/dataload/sources/hubmap/uploader.py',
      },
      stats: {
        hubmap: 1259,
      },
      download_date: '2023-04-05T20:16:09.873000',
      version: '2023-01-01T00:00:17Z',
      upload_date: '2023-04-05T20:16:10.141000',
    },
    mendeley: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/mendeley/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '2ca325d',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/2ca325d915ce0c804d00f971e081128844053442/biothings-hub/files/nde-hub/hub/dataload/sources/mendeley/uploader.py',
      },
      stats: {
        mendeley: 57137,
      },
      download_date: '2023-04-05T20:16:56.651000',
      version: '2022-12-31T02:00:12Z',
      upload_date: '2023-04-05T20:17:00.491000',
      sourceInfo: {
        name: 'Mendeley Data',
        description:
          'Mendeley Data, a product of Elsevier, is one of the newest entrants in the research data repository landscape; the platform was released in April 2016. Mendeley Data is a general-purpose repository, allowing researchers in any field to upload and publish research data. Mendeley Data also allows researchers to share unpublished data privately with research collaborators.',
        schema: {
          id: 'identifer',
          doi: 'doi',
          name: 'name',
          description: 'description',
          contributors: 'contributors',
          files: 'distribution',
          articles: 'citation',
          categories: 'keywords',
          publish_date: 'datePublished',
          related_links: 'citation',
          modified_on: 'dateModified',
          links: 'url',
          repository: 'sdPublisher',
        },
        url: 'https://data.mendeley.com/',
        identifier: 'Mendeley',
      },
    },
    clinepidb: {
      sourceInfo: {
        schema: {
          summary: 'description',
          contact_name: 'author.name',
          Years: 'temporalCoverage',
          disease: 'healthCondition',
          Publications: 'citation',
          Study_Design: 'measurementTechnique',
          description: 'description',
          Participant_Type: 'keywords',
          dataset_name: 'distribution.name',
          HyperLinks: 'isBasedOn.url',
          Contacts: 'affiliation',
          release_date: 'distribution.dateModified',
          Country: 'spatialCoverage',
          study_access: 'conditionOfAccess',
          WHO: 'keywords',
        },
        identifier: 'ClinEpiDB',
        name: 'ClinEpiDB',
        description:
          'ClinEpiDB, launched in February 2018, is an open-access exploratory data analysis platform. We integrate data from high quality epidemiological studies, and offer tools and visualizations to explore the data within the browser in a point and click interface. We enable investigators to maximize the utility and reach of their data and to make optimal use of data released by others. ClinEpiDB is led by a team of scientists and developers based at the University of Pennsylvania, the University of Georgia, Imperial College London, and several other academic institutions. Currently, we are funded by the Bill and Melinda Gates Foundation for resource development and data integration, and by NIAID for integration of data from the International Centers of Excellence in Malaria Research (ICEMR).',
        url: 'https://clinepidb.org/ce/app',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/clinepidb/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '5b6567c',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/5b6567c825f0272dc894ea2d1df3d5bbc26c2e17/biothings-hub/files/nde-hub/hub/dataload/sources/clinepidb/uploader.py',
      },
      stats: {
        clinepidb: 47,
      },
      download_date: '2023-04-08T12:02:27.697000',
      version: '2023-04-08T01:00:05Z',
      upload_date: '2023-04-08T12:02:30.234000',
    },
    ncbi_geo: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_geo/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '5b6567c',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/5b6567c825f0272dc894ea2d1df3d5bbc26c2e17/biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_geo/uploader.py',
      },
      stats: {
        ncbi_geo: 190925,
      },
      download_date: '2023-04-05T20:17:28.374000',
      version: '2023-01-01T00:00:40Z',
      url: 'https://www.ncbi.nlm.nih.gov/geo/browse/',
      license_url: 'https://www.ncbi.nlm.nih.gov/home/about/policies/',
      upload_date: '2023-04-05T20:35:34.175000',
      sourceInfo: {
        name: 'NCBI Gene Expression Omnibus',
        description:
          'GEO is a public functional genomics data repository supporting MIAME-compliant data submissions. Array- and sequence-based data are accepted. Tools are provided to help users query and download experiments and curated gene expression profiles.',
        schema: {
          _id: 'identifier',
          'contributor(s)': 'author',
          organization: 'publisher',
          title: 'name',
          organism: 'species',
          'experiment type': 'measurementTechnique',
          summary: 'description',
          'submission date': 'datePublished',
          'last update date': 'dateModified',
          'citation(s)': 'citation',
        },
        url: 'https://www.ncbi.nlm.nih.gov/geo/',
        identifier: 'NCBI GEO',
      },
    },
    dryad: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/dryad/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '8cf3373',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/8cf33733eca860c8e2bc8108e74d65f4e0e44c85/biothings-hub/files/nde-hub/hub/dataload/sources/dryad/uploader.py',
      },
      stats: {
        dryad: 52378,
      },
      download_date: '2023-04-09T12:02:34.759000',
      version: '2023-04-07T00:00:06Z',
      upload_date: '2023-04-09T12:02:40.107000',
      sourceInfo: {
        name: 'Dryad Digital Repository',
        description:
          'Dryad is an open source, community driven project that takes a unique approach to data publication and digital preservation. Dryad focuses on search, presentation, and discovery and delegates the responsibility for the data preservation function to the underlying repository with which it is integrated. Dryad aims to allow researchers to validate published findings, explore new analysis methodologies, re-purpose data for research questions unanticipated by the original authors, and perform synthetic studies such as formal meta-analyses.',
        schema: {
          name: 'name',
          description: 'description',
          contentUrl: 'contentUrl',
          identifier: 'identifier, doi',
          keywords: 'keywords',
          creator: 'author',
          distribution: 'distribution',
          temporalCoverage: 'temporalCoverage',
          spatialCoverage: 'spatialCoverage',
          citation: 'citation',
          license: 'license',
          datePublished: 'datePublished',
          conditions: 'healthCondition.name',
          outcomeNames: 'variable_measured',
          digitalObjectId: 'doi',
          studyMetadataDoi: 'doi',
          extractedBriefSummary: 'description',
          draftCreatedDate: 'dateCreated',
          postedDate: 'datePublished',
          updatedDate: 'dateModified',
        },
        url: 'https://datadryad.org',
        identifier: 'Dryad Digital Repository',
      },
    },
    dataverse: {
      sourceInfo: {
        schema: {
          funder: 'funder',
          keywords: 'keywords',
          '@type': '@type',
          description: 'description',
          distribution: 'distribution',
          type: '@type',
          identifier_of_dataverse: 'sdPublisher.identifier',
          createdAt: 'dateCreated',
          published_at: 'datePublished',
          name_of_dataverse: 'sdPublisher.name',
          updatedAt: 'dateModified',
          identifier: 'url, doi, identifier',
          creator: 'author',
          citation: 'citation.citation',
          author: 'author',
          subjects: 'topicCategory',
          global_id: 'doi',
          dateModified: 'dateModified',
          '@context': '@context',
          datePublished: 'datePublished',
          license: 'license',
          includedInDataCatalog: 'includedInDataCatalog',
          name: 'name',
          publisher: 'sdPublisher',
          authors: 'author.name',
        },
        identifier: 'Harvard Dataverse',
        name: 'Dataverse',
        description:
          'The Harvard Dataverse Repository is a free data repository open to all researchers from any discipline, both inside and outside of the Harvard community, where you can share, archive, cite, access, and explore research data. Each individual Dataverse collection is a customizable collection of datasets (or a virtual repository) for organizing, managing, and showcasing datasets.',
        url: 'https://dataverse.harvard.edu/',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/dataverse/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '8fdccd5',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/8fdccd5a9458b543baffaa2036f71ce9c22e319d/biothings-hub/files/nde-hub/hub/dataload/sources/dataverse/uploader.py',
      },
      stats: {
        dataverse: 93424,
      },
      download_date: '2023-04-05T20:15:00.520000',
      version: '2023-02-10T21:37:21Z',
      upload_date: '2023-04-05T20:15:10.102000',
    },
  },
  stats: {
    total: 5622103,
  },
};