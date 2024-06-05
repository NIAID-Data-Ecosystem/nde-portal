export const mockRepositoriesMetadata = {
  biothing_type: 'dataset',
  build_date: '2024-05-31T09:37:00.549507-07:00',
  build_version: '20240531',
  src: {
    lincs: {
      sourceInfo: {
        abstract:
          'The Library of Integrated Network-Based Cellular Signatures (LINCS) Data Portal is an NIH supported repository that includes gene expression and other cellular processes data.',
        description:
          'The BD2K-LINCS DCIC is comprised of four major components: Integrated Knowledge Environment (IKE), Data Science Research (DSR), Community Training and Outreach (CTO) and Consortium Coordination and Administration (CCA). The Center is constructing a high-capacity scalable integrated knowledge environment enabling federated access, intuitive querying and integrative analysis and visualization across all LINCS resources and many additional external data types from other relevant resources. The Center’s data science research projects are aimed at addressing various data integration and intracellular molecular regulatory network challenges. The Center aims to develop: 1) methods to connect cellular and organismal phenotypes with molecular cellular signatures, and 2) novel data visualization methods for dynamically interacting with large-genomics and proteomics datasets.',
        identifier: 'LINCS',
        name: 'BD2K-LINCS DCIC',

        url: 'https://lincsportal.ccs.miami.edu/',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/lincs/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: 'df82c91',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/df82c91086f41d34d6488a8db18799f2a40ab322/biothings-hub/files/nde-hub/hub/dataload/sources/lincs/uploader.py',
      },
      stats: {
        lincs: 345,
      },
      download_date: '2023-11-28T22:43:53.590000',
      version: '2023-11-28T22:43:42Z',
      upload_date: '2024-04-26T21:46:18.345000',
    },
    malariagen: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/malariagen/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '595edd3',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/595edd3a6c390b44cabbc15e343687f28eedf450/biothings-hub/files/nde-hub/hub/dataload/sources/malariagen/uploader.py',
      },
      stats: {
        malariagen: 48,
      },
      download_date: '2024-05-15T22:51:10.225000',
      version: '2024-05-15T22:50:59Z',
      upload_date: '2024-05-15T22:51:20.073000',
      sourceInfo: {
        name: 'MalariaGEN',
        abstract:
          'Malaria Genomic Epidemiology Network (MalariaGEN) is a IID repository that includes clinical data.',
        description:
          "MalariaGEN is an international network of researchers focused on understanding the genetic variations in humans, Plasmodium parasites, and Anopheles mosquitoes to better control malaria transmission. By leveraging advanced genomic tools and techniques, MalariaGEN aims to uncover how genetic differences influence susceptibility to malaria, track insecticide resistance in mosquitoes, and detect drug resistance in parasites. The network's efforts are crucial for developing new interventions and maintaining the effectiveness of existing ones. Coordinated from the Wellcome Sanger Institute in the UK, MalariaGEN collaborates with over 200 partners across more than 40 countries, primarily in malaria-endemic regions.",

        url: 'https://www.malariagen.net/',
        identifier: 'MalariaGEN',
        conditionsOfAccess: 'Varied',
        genre: 'IID',
      },
    },
    dde: {
      license: 'Creative Commons Attribution 4.0 International',
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/dde/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '8cf1a96',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/8cf1a960abecbca2f4d4ebe476a504e653583e39/biothings-hub/files/nde-hub/hub/dataload/sources/dde/uploader.py',
      },
      stats: {
        dde: 430,
      },
      download_date: '2024-05-30T21:46:48.530000',
      version: '2024-05-30T21:46:37Z',
      url: 'https://discovery.biothings.io/api/dataset/',
      license_url: 'https://creativecommons.org/licenses/by/4.0/',
      upload_date: '2024-05-30T22:43:24.287000',
      sourceInfo: {
        name: 'Data Discovery Engine',
        abstract:
          'The Data Discovery Engine is a NIAID supported metadata registry that includes metadata from IID and general repositories.',
        description:
          "The Data Discovery Engine is a streamlined process to create, distribute and harves findable metadata via interoperable Schema.org schemas. The biomedical and informatics communities have largely endorsed the spirit and basic components of the FAIR Data Principles. Biomedical data producers, including CTSA hubs, need actionable best-practice guidance on how to make their data discoverable and reusable, and bring the practical benefits of data sharing to researcher's own research projects, as well as the research community as a whole.",

        url: 'https://discovery.biothings.io/',
        identifier: 'Data Discovery Engine',
        conditionsOfAccess: 'Varied',
        genre: 'Generalist',
      },
    },
    zenodo: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/zenodo/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '2884218',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/2884218646bc42e854c381b70cc91abb780a668e/biothings-hub/files/nde-hub/hub/dataload/sources/zenodo/uploader.py',
      },
      stats: {
        zenodo: 3042964,
      },
      download_date: '2023-09-10T11:10:16.037000',
      version: '2023-09-10T11:05:37Z',
      upload_date: '2024-05-01T16:51:31.070000',
      sourceInfo: {
        name: 'Zenodo',
        abstract:
          'Zenodo is a GREI repository that includes most data types and domains.',
        description:
          'The OpenAIRE project, in the vanguard of the open access and open data movements in Europe was commissioned by the EC to support their nascent Open Data policy by providing a catch-all repository for EC funded research. CERN, an OpenAIRE partner and pioneer in open source, open access and open data, provided this capability and Zenodo was launched in May 2013.',

        url: 'https://zenodo.org/',
        identifier: 'Zenodo',
        conditionsOfAccess: 'Varied',
        genre: 'Generalist',
      },
    },
    ncbi_sra: {
      sourceInfo: {
        abstract:
          'Sequence Read Archive (SRA) is the NIH supported largest publicly available repository of high throughput sequencing data that includes raw sequencing data and alignment information for most domains.',
        description:
          'Sequence Read Archive(SRA) data, available through multiple cloud providers and NCBI servers, is the largest publicly available repository of high throughput sequencing data. The archive accepts data from all branches of life as well as metagenomic and environmental surveys. SRA stores raw sequencing data and alignment information to enhance reproducibility and facilitate new discoveries through data analysis.',
        identifier: 'NCBI SRA',
        name: 'NCBI SRA',

        url: 'https://www.ncbi.nlm.nih.gov/sra',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_sra/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '1e9c549',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/1e9c549b4c9b346478b1914faf5776d95dc6a56b/biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_sra/uploader.py',
      },
      stats: {
        ncbi_sra: 339001,
      },
      download_date: '2023-04-05T20:20:47.067000',
      version: '2023-02-01T02:26:21Z',
      upload_date: '2024-04-26T21:46:48.262000',
    },
    reframedb: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/reframedb/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/reframedb/uploader.py',
      },
      stats: {
        reframedb: 188,
      },
      download_date: '2024-04-26T20:14:12.442000',
      version: '2024-04-26T20:14:01Z',
      upload_date: '2024-04-26T21:46:55.322000',
      sourceInfo: {
        name: 'ReframeDB',
        abstract:
          'ReframeDB is a Calibr maintained repository that has a screening set of 12,000 compounds for drug repositioning.',
        description:
          'The ReFRAME collection of 12,000 compounds is a best-in-class drug repurposing library containing nearly all small molecules that have reached clinical development or undergone significant preclinical profiling. The purpose of such a screening collection is to enable rapid testing of compounds with demonstrated safety profiles in new indications, such as neglected or rare diseases, where there is less commercial motivation for expensive research and development.',

        url: 'https://reframedb.org/',
        identifier: 'ReframeDB',
        conditionsOfAccess: 'Unknown',
        genre: 'IID',
      },
    },
    hca: {
      sourceInfo: {
        abstract:
          'The Human Cell Atlas is a repository that includes multimodal data of cells in the human body.',
        description:
          'Thanks to new single cell genomics and spatial imaging technologies developed since the late 2000s and early 2010s, it is now possible to measure gene expression profiles in individual cells. These large scale data can be used with machine learning algorithms to decipher how the cells differ from and interact with their neighbors, and how they form and function in the tissue. This now allows scientists to identify and understand cell types in unprecedented detail, resolution and breadth. The Human Cell Atlas (HCA) is an international group of researchers using a combination of these new technologies to create cellular reference maps with the position, function and characteristics of every cell type in the human body.',
        identifier: 'Human Cell Atlas',
        name: 'Human Cell Atlas',

        url: 'https://www.humancellatlas.org/',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/hca/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '27da86a',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/27da86acf40a7fc3d12f4c1febc6d6ebd27de76e/biothings-hub/files/nde-hub/hub/dataload/sources/hca/uploader.py',
      },
      stats: {
        hca: 386,
      },
      download_date: '2023-07-31T17:48:18.356000',
      version: '2023-07-31T17:48:07Z',
      upload_date: '2024-04-26T21:28:55.778000',
    },
    microbiomedb: {
      sourceInfo: {
        abstract:
          'MicrobiomeDB is a NIAID supported repository that includes clinical microbiome data and analysis tools.',
        description:
          'MicrobiomeDB was developed as a discovery tool that empowers researchers to fully leverage their experimental metadata to construct queries that interrogate microbiome datasets.',
        name: 'MicrobiomeDB',
        identifier: 'MicrobiomeDB',

        url: 'https://microbiomedb.org/mbio/app',
        conditionsOfAccess: 'Open',
        genre: 'IID',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/microbiomedb/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/microbiomedb/uploader.py',
      },
      stats: {
        microbiomedb: 22,
      },
      download_date: '2024-05-02T22:29:12.044000',
      version: '2024-05-02T22:29:01Z',
      upload_date: '2024-05-06T06:01:23.840000',
    },
    acd_niaid: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/acd_niaid/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: 'df82c91',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/df82c91086f41d34d6488a8db18799f2a40ab322/biothings-hub/files/nde-hub/hub/dataload/sources/acd_niaid/uploader.py',
      },
      stats: {
        acd_niaid: 7,
      },
      download_date: '2024-04-22T22:23:41.835000',
      version: '2024-04-22T22:23:30Z',
      upload_date: '2024-04-26T21:07:24.742000',
      sourceInfo: {
        name: 'AccessClinicalData@NIAID',
        abstract:
          'AccessClinicalData is a NIAID supported IID repository that includes clinical trials data.',
        description:
          'AccessClinicalData@NIAID is a NIAID cloud-based, secure data platform that enables sharing of and access to reports and data sets from NIAID COVID-19 and other sponsored clinical trials for the basic and clinical research community.',

        url: 'https://accessclinicaldata.niaid.nih.gov/',
        identifier: 'AccessClinicalData@NIAID',
        conditionsOfAccess: 'Varied',
        genre: 'IID',
      },
    },
    immport: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/immport/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '6d85feb',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/6d85feb6baa1f6ddc65d8179e04e9ab12c7f0b07/biothings-hub/files/nde-hub/hub/dataload/sources/immport/uploader.py',
      },
      stats: {
        immport: 952,
      },
      download_date: '2024-04-26T20:33:14.073000',
      version: '2024-04-26T20:33:02Z',
      url: 'https://www.immport.org/shared/home',
      license_url: 'https://docs.immport.org/home/agreement/',
      upload_date: '2024-05-16T16:37:00.141000',
      sourceInfo: {
        name: 'ImmPort',
        abstract:
          'The Immunology Database and Analysis Portal (ImmPort) is a NIAID supported IID repository that includes multimodal immunological data.',
        description:
          'The ImmPort project provides advanced information technology support in the archiving and exchange of scientific data for the diverse community of life science researchers supported by NIAID/DAIT and serves as a long-term, sustainable archive of research and clinical data. The core component of ImmPort is an extensive data warehouse containing experimental data and metadata describing the purpose of the study and the methods of data generation. The functionality of ImmPort will be expanded continuously over the life of the BISC project to accommodate the needs of expanding research communities. The shared research and clinical data, as well as the analytical tools in ImmPort are available to any researcher after registration.',

        url: 'https://www.immport.org/shared/home',
        identifier: 'ImmPort',
        conditionsOfAccess: 'Unknown',
        genre: 'IID',
      },
    },
    omicsdi: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/omicsdi/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: 'fe74a10',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/fe74a106c02af1c75a3bf15acccf77ecc34bfa9e/biothings-hub/files/nde-hub/hub/dataload/sources/omicsdi/uploader.py',
      },
      stats: {
        omicsdi: 2220493,
      },
      download_date: '2024-04-09T18:13:58.954000',
      version: '2024-02-21T20:11:17Z',
      url: 'https://www.omicsdi.org/search',
      license_url: 'https://www.ebi.ac.uk/licencing',
      upload_date: '2024-04-15T22:17:41.093000',
      sourceInfo: {
        name: 'OmicsDI',
        abstract:
          'Omics Discovery Index (OmicsDI) is a generalist repository that is part of ELIXIR infrastructure that includes multi-omics data for most domains.',
        description:
          'The Omics Discovery Index (OmicsDI) provides a knowledge discovery framework across heterogeneous omics data (genomics, proteomics, transcriptomics and metabolomics).',

        url: 'https://www.omicsdi.org/',
        identifier: 'Omics Discovery Index (OmicsDI)',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
    },
    veupathdb: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/veupathdb/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/veupathdb/uploader.py',
      },
      stats: {
        veupathdb: 3005,
      },
      download_date: '2023-07-26T22:56:46.347000',
      version: '2023-07-26T22:56:35Z',
      upload_date: '2024-04-26T22:13:25.701000',
      sourceInfo: {
        name: 'VEuPathDB',
        abstract:
          'The Eukaryotic Pathogen, Vector and Host Informatics Resource (VEuPathDB) is a NIAID supported IID repository that includes genomic and phenotypic data for eukaryotic pathogens and invertebrate vectors of infectious disease.',
        description:
          'The Eukaryotic Pathogen, Vector and Host Informatics Resource (VEuPathDB) is one of two Bioinformatics Resource Centers (BRCs) funded by the US National Institute of Allergy and Infectious Diseases (NIAID), with additional support from the Wellcome Trust (UK). VEuPathDB provides access to diverse genomic and other large scale datasets related to eukaryotic pathogens and invertebrate vectors of disease. Organisms supported by this resource include (but are not limited to) the NIAID list of emerging and re-emerging infectious diseases.',

        url: 'https://veupathdb.org/veupathdb/app/',
        identifier: 'VEuPathDB',
        conditionsOfAccess: 'Unknown',
        genre: 'IID',
      },
    },
    vivli: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/vivli/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '6bdd9bb',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/6bdd9bb874102baf35180f0436403ac3cabe70ad/biothings-hub/files/nde-hub/hub/dataload/sources/vivli/uploader.py',
      },
      stats: {
        vivli: 7210,
      },
      download_date: '2024-02-14T18:35:35.562000',
      version: '2024-02-14T18:35:24Z',
      url: 'https://search.vivli.org/',
      license_url: 'https://vivli.org/resources/vivli-data-use-agreement/',
      upload_date: '2024-04-26T22:13:30.036000',
      sourceInfo: {
        name: 'Vivli',
        abstract:
          'Vivli is a GREI repository that includes most data types and domains.',
        description:
          'Vivli is an independent non-profit organization launched in 2016. Vivli evolved from a project of The Multi-Regional Clinical Trials Center of Brigham and Women’s Hospital and Harvard(MRCT Center) to enhance access to clinical trials data by promoting data sharing and transparency. In 2013, the MRCT Center and a diverse group of global stakeholders embarked on a mission to define, design, and launch an innovative platform solution for global clinical trial data sharing. The Vivli platform provides access to anonymized individual participant-level data(IPD) or the raw data that is collected during a clinical trial. The clinical trials represented in Vivli are global and contributed by a diverse group of data contributors. By serving as a global trusted platform, Vivli increases the discoverability of available data in the wider research ecosystem, and increases the overall capacity worldwide for effective data sharing, aggregation, re-use, and novel analysis of valuable clinical research data to advance science and improve public health. The Vivli platform is a cloud-based platform that consists of a dynamic search engine, a data repository, and a secure research environment.',

        url: 'https://vivli.org/',
        identifier: 'Vivli',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
    },
    hubmap: {
      sourceInfo: {
        abstract:
          'The Human BioMolecular Atlas Program (HuBMAP) is an NIH supported repository that includes multimodal data of healthy cells in the human body.',
        description:
          'HuBMAP is part of a rich ecosystem of established and emerging atlasing programs supported by NIH and globally by other funding organizations, many of which are focused on specific organs or diseases. HuBMAP has connected with these programs to ensure data interoperability, avoid duplication of work, and leverage and synergize gained knowledge. The consortium has organized a number of events to bring together these communities to discuss topics of shared interest and is committed to improving coordination and collaboration among different programs. In addition, many of the HuBMAP PIs had been or are still actively participating in these efforts, helping with cross-pollination and advancing our global understanding. HuBMAP, as its name implies, was specifically initiated to resolve the challenge of building integrated, comprehensive, high-resolution spatial maps of human tissues and organs, which has resulted in HuBMAP providing leadership in the ecosystem around techniques for integrating disparate, multi-dimensional and multi-scale datasets, the development of a Common Coordinate Framework (CCF) for integrating data across many individuals, and the development and validation of these assays. To further increase interoperability, HuBMAP has adopted a number of standards and processes developed by other domain expert consortia, working and is actively involved in the knowledge exchange. The consortium sees itself as an integral part of the ecosystem, sharing its strengths and actively contributing to the community.',
        identifier: 'HuBMAP',
        name: 'HuBMAP',

        url: 'https://hubmapconsortium.org/',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/hubmap/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: 'd34240f',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/d34240f6278928215f74df40e7a3b9b9bad8a78c/biothings-hub/files/nde-hub/hub/dataload/sources/hubmap/uploader.py',
      },
      stats: {
        hubmap: 1948,
      },
      download_date: '2023-07-31T18:02:15.854000',
      version: '2023-07-31T18:02:04Z',
      upload_date: '2024-04-26T21:28:56.828000',
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
        mendeley: 83059,
      },
      download_date: '2024-05-24T19:04:34.929000',
      version: '2024-05-24T19:04:28Z',
      upload_date: '2024-05-24T19:04:40.070000',
      sourceInfo: {
        name: 'Mendeley Data',
        abstract:
          'Mendeley Data is a GREI repository that includes most data types and domains.',
        description:
          'Mendeley Data, a product of Elsevier, is one of the newest entrants in the research data repository landscape; the platform was released in April 2016. Mendeley Data is a general-purpose repository, allowing researchers in any field to upload and publish research data. Mendeley Data also allows researchers to share unpublished data privately with research collaborators.',

        url: 'https://data.mendeley.com/',
        identifier: 'Mendeley',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
    },
    clinepidb: {
      sourceInfo: {
        abstract:
          'ClinEpiDB is a NIAID supported IID repository that includes epidemiological data.',
        description:
          'ClinEpiDB, launched in February 2018, is an open-access exploratory data analysis platform. We integrate data from high quality epidemiological studies, and offer tools and visualizations to explore the data within the browser in a point and click interface. We enable investigators to maximize the utility and reach of their data and to make optimal use of data released by others. ClinEpiDB is led by a team of scientists and developers based at the University of Pennsylvania, the University of Georgia, Imperial College London, and several other academic institutions. Currently, we are funded by the Bill and Melinda Gates Foundation for resource development and data integration, and by NIAID for integration of data from the International Centers of Excellence in Malaria Research (ICEMR).',
        identifier: 'ClinEpiDB',
        name: 'ClinEpiDB',

        url: 'https://clinepidb.org/ce/app',
        conditionsOfAccess: 'Unknown',
        genre: 'IID',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/clinepidb/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/clinepidb/uploader.py',
      },
      stats: {
        clinepidb: 50,
      },
      download_date: '2023-10-25T23:14:41.581000',
      version: '2023-10-25T23:14:30Z',
      upload_date: '2024-04-26T21:07:29.389000',
    },
    ncbi_geo: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_geo/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: 'df82c91',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/df82c91086f41d34d6488a8db18799f2a40ab322/biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_geo/uploader.py',
      },
      stats: {
        ncbi_geo: 225071,
      },
      download_date: '2024-04-09T18:13:49.630000',
      version: '2024-04-05T22:59:25Z',
      url: 'https://www.ncbi.nlm.nih.gov/geo/browse/',
      license_url: 'https://www.ncbi.nlm.nih.gov/home/about/policies/',
      upload_date: '2024-04-15T18:18:29.053000',
      sourceInfo: {
        name: 'NCBI GEO',
        abstract:
          'Gene Expression Omnibus (GEO) is an NIH supported repository that includes microarray and next-generation sequencing data for high-throughput functional genomics for most domains.',
        description:
          'GEO is a public functional genomics data repository supporting MIAME-compliant data submissions. Array- and sequence-based data are accepted. Tools are provided to help users query and download experiments and curated gene expression profiles.',

        url: 'https://www.ncbi.nlm.nih.gov/geo/',
        identifier: 'NCBI GEO',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
    },
    qiita: {
      sourceInfo: {
        abstract:
          'Qiita is a repository that includes microbiome data and analysis tools.',
        description:
          "Qiita(canonically pronounced cheetah) is an entirely open-source microbial study management platform. It allows users to keep track of multiple studies with multiple 'omics data. Additionally, Qiita is capable of supporting multiple analytical pipelines through a 3rd-party plugin system, allowing the user to have a single entry point for all of their analyses. Qiita provides database and compute resources to the global community, alleviating the technical burdens that are typically limiting for researchers studying microbial ecology(e.g. familiarity with the command line or access to compute power).Qiita's platform allows for quick reanalysis of the datasets that have been deposited using the latest analytical technologies. This means that Qiita's internal datasets are living data that is periodically re-annotated according to current best practices.",
        identifier: 'Qiita',
        name: 'Qiita',

        url: 'https://qiita.ucsd.edu/',
        conditionsOfAccess: 'Unknown',
        genre: 'IID',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/qiita/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/qiita/uploader.py',
      },
      stats: {
        qiita: 703,
      },
      download_date: '2023-07-26T22:56:24.427000',
      version: '2023-07-26T22:56:11Z',
      upload_date: '2024-04-26T21:46:53.335000',
    },
    dryad: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/dryad/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/dryad/uploader.py',
      },
      stats: {
        dryad: 58440,
      },
      download_date: '2024-05-05T08:19:50.646000',
      version: '2024-05-05T08:19:19Z',
      upload_date: '2024-05-06T16:15:01.857000',
      sourceInfo: {
        name: 'Dryad Digital Repository',
        abstract:
          'Dryad Digital Repository is a GREI repository that includes most data types and domains.',
        description:
          'Dryad is an open source, community driven project that takes a unique approach to data publication and digital preservation. Dryad focuses on search, presentation, and discovery and delegates the responsibility for the data preservation function to the underlying repository with which it is integrated. Dryad aims to allow researchers to validate published findings, explore new analysis methodologies, re-purpose data for research questions unanticipated by the original authors, and perform synthetic studies such as formal meta-analyses.',

        url: 'https://datadryad.org',
        identifier: 'Dryad Digital Repository',
        conditionsOfAccess: 'Open',
        genre: 'Generalist',
      },
    },
    flowrepository: {
      sourceInfo: {
        abstract:
          'Flow Repository is a repository that includes flow cytometry data.',
        description:
          'FlowRepository is a database of flow cytometry experiments where you can query and download data collected and annotated according to the MIFlowCyt standard. It is primarily used as a data deposition place for experimental findings published in peer-reviewed journals in the flow cytometry field.',
        identifier: 'Flow Repository',
        name: 'Flow Repository',

        url: 'http://flowrepository.org/',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/flowrepository/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '27da86a',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/27da86acf40a7fc3d12f4c1febc6d6ebd27de76e/biothings-hub/files/nde-hub/hub/dataload/sources/flowrepository/uploader.py',
      },
      stats: {
        flowrepository: 1823,
      },
      download_date: '2023-07-31T18:06:37.441000',
      version: '2023-07-31T18:06:26Z',
      upload_date: '2024-04-26T21:28:49.214000',
    },
    ncbi_pmc: {
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_pmc/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/ncbi_pmc/uploader.py',
      },
      stats: {
        ncbi_pmc: 11094,
      },
      download_date: '2023-10-07T15:33:37.236000',
      version: '2023-10-07T15:33:01Z',
      upload_date: '2024-04-26T21:46:39.096000',
      sourceInfo: {
        name: 'NCBI PMC',
        description:
          "PubMed Central® (PMC) is a free full-text archive of biomedical and life sciences journal literature at the U.S. National Institutes of Health's National Library of Medicine (NIH/NLM). In keeping with NLM's legislative mandate to collect and preserve the biomedical literature, PMC is part of the NLM collection, which also includes NLM's extensive print and licensed electronic journal holdings and supports contemporary biomedical and health care research and practice as well as future scholarship. Available to the public online since 2000, PMC was developed and is maintained by the National Center for Biotechnology Information(NCBI) at NLM.",

        url: 'https://www.ncbi.nlm.nih.gov/pmc/',
        identifier: 'NCBI PMC',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
    },
    dash: {
      sourceInfo: {
        abstract:
          'The Data and Specimen Hub (DASH) is an NICHD supported repository that includes clinical data and specimens.',
        description:
          'The NICHD Data and Specimen Hub(DASH) is a centralized resource that allows researchers to share and access de-identified data from studies funded by NICHD. DASH also serves as a portal for requesting biospecimens from selected DASH studies. DASH serves as a mechanism for NICHD-funded extramural and intramural investigators to share research data from studies in accordance with NIH Data Sharing Policies. Many of the NICHD-funded research studies also collected biospecimens that are stored in the NICHD Contracted Biorepository. To provide access to these biospecimens, DASH will store and make available to other investigators the biospecimen catalog for studies that have associated research data in DASH. By supporting data and biospecimen access through DASH, NICHD aims to accelerate scientific findings and improve human health.',
        identifier: 'NICHD DASH',
        name: 'NICHD Data and Specimen Hub (DASH)',

        url: 'https://dash.nichd.nih.gov/',
        conditionsOfAccess: 'Restricted',
        genre: 'Generalist',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/dash/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/dash/uploader.py',
      },
      stats: {
        dash: 11423,
      },
      download_date: '2023-12-18T20:01:51.453000',
      version: '2023-12-18T20:01:50Z',
      upload_date: '2024-04-26T21:07:28.056000',
    },
    vdj: {
      sourceInfo: {
        abstract:
          'VDJServer is a NIAID supported repository that includes immune repertoire sequencing data.',
        description:
          'VDJServer is a free, scalable resource for performing immune repertoire analysis and sharing data. VDJServer Community Data Portal is part of the AIRR Data Commons. Funded by a National Institute of Allergy and Infectious Diseases research grant (#1R01A1097403), the VDJServer project is led by The University of Texas Southwestern (UTSW) Medical Center in collaboration with the J. Craig Venter Institute and Yale University. The Texas Advanced Computing Center (TACC) at The University of Texas at Austin leads the cyberinfrastructure implementation, including the high performance computing (HPC) systems, storage, and software solutions.',
        identifier: 'VDJServer',
        name: 'VDJServer',

        url: 'https://vdj-staging.tacc.utexas.edu/community/',
        conditionsOfAccess: 'Unknown',
        genre: 'IID',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/vdj/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '6d85feb',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/6d85feb6baa1f6ddc65d8179e04e9ab12c7f0b07/biothings-hub/files/nde-hub/hub/dataload/sources/vdj/uploader.py',
      },
      stats: {
        vdj: 65,
      },
      download_date: '2024-05-02T22:29:17.759000',
      version: '2024-05-02T22:29:06Z',
      upload_date: '2024-05-16T16:36:55.144000',
    },
    dataverse: {
      sourceInfo: {
        abstract:
          'Harvard Dataverse is a GREI repository that includes most data types and domains.',
        description:
          'The Harvard Dataverse Repository is a free data repository open to all researchers from any discipline, both inside and outside of the Harvard community, where you can share, archive, cite, access, and explore research data. Each individual Dataverse collection is a customizable collection of datasets (or a virtual repository) for organizing, managing, and showcasing datasets.',
        identifier: 'Harvard Dataverse',
        name: 'Harvard Dataverse',

        url: 'https://dataverse.harvard.edu/',
        conditionsOfAccess: 'Unknown',
        genre: 'Generalist',
      },
      code: {
        file: 'biothings-hub/files/nde-hub/hub/dataload/sources/dataverse/uploader.py',
        repo: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers.git',
        commit: '02fbd48',
        branch: 'main',
        url: 'git@github.com:NIAID-Data-Ecosystem/nde-crawlers/tree/02fbd48b2d83d1bc4c760296e576ab69b03eafa0/biothings-hub/files/nde-hub/hub/dataload/sources/dataverse/uploader.py',
      },
      stats: {
        dataverse: 114512,
      },
      download_date: '2024-04-09T18:08:22.653000',
      version: '2024-04-09T18:08:00Z',
      upload_date: '2024-05-07T17:40:16.740000',
    },
  },
  stats: {
    total: 5976598,
  },
};
