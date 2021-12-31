import {Box, Heading, Flex, Icon, Text, Button} from '@chakra-ui/react';
import type {NextPage} from 'next';
import Link from 'src/components/global/link';
import Head from 'next/head';
import {
  Navigation,
  Section,
  Typography,
  ColorSwatch,
} from 'src/components/styleguide';
import {theme} from 'src/theme';
import {
  FaRegFile,
  FaRegUser,
  FaRegPaperPlane,
  FaRegImage,
  FaRegHeart,
  FaRegComment,
  FaRegEnvelope,
  FaRegCheckCircle,
  FaRegEdit,
  FaRegThumbsUp,
  FaRegCompass,
  FaRegTrashAlt,
} from 'react-icons/fa';
import {SearchResultCard} from 'src/components/search-results';
import SearchBar from 'src/components/search-bar';

// Style Guide for the NDE Portal
const Styleguide: NextPage = () => {
  return (
    <div>
      <Head>
        <title>NDE Portal | Styleguide</title>
        <meta
          name='description'
          content='NDE portal styleguide instructions.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Flex
        as='main'
        bg='niaid.100'
        justifyContent='center'
        flexDirection='column'
        alignItems='center'
      >
        <Flex
          p={[2, 4, '5%']}
          justifyContent='center'
          flexDirection='column'
          alignItems='center'
          maxW='1200px'
          w={'100%'}
        >
          <Heading as='h1' size='h2' fontFamily='body'>
            Style Guide
          </Heading>
          <Navigation title='Jump to'>
            <ul>
              <li>
                <Link href='#typography'>Typography</Link>
              </li>
              <li>
                <Link href='#colors'>Colors</Link>
              </li>
              <li>
                <Link href='#buttons'>Buttons</Link>
              </li>
              <li>
                <Link href='#link'>Link</Link>
              </li>
              <li>
                <Link href='#icons'>Icons</Link>
              </li>
              <li>
                <Link href='#shadows'>Shadows</Link>
              </li>
            </ul>
            <Heading fontSize='xs' fontFamily='body' my={3} color='niaid.200'>
              COMPONENTS
            </Heading>
            <ul>
              <li>
                <Link href='#component-search-result-card'>
                  Search Result Card
                </Link>
              </li>
              <li>
                <Link href='#component-search-bar'>Search Bar</Link>
              </li>
            </ul>
          </Navigation>
          {/* Typography */}
          <Section title='Typography' my={0}>
            <Typography fontFamily='Martel' />
            <Box w={['75%', '50%']} h={0.75} bg='gray.100' />
            <Typography fontFamily='Merriweather' />
            <Box w={['75%', '50%']} h={0.75} bg='gray.100' />
            <Typography fontFamily='Public Sans' />
          </Section>

          {/* Colors */}
          <Section title='Colors'>
            <Box>
              <Heading as='h5' size='h5' fontFamily='body' my={2}>
                Grayscale
              </Heading>
              <Flex direction={['column', 'row']} flexWrap='wrap'>
                {(Object.entries(theme.colors.gray) as [string, string][]).map(
                  ([key, hex]) => {
                    const description: {
                      [key: string]: string;
                    } = {
                      '200': 'Light (border)',
                      '700': 'Input + Link (border)',
                    };
                    return (
                      <ColorSwatch
                        key={key}
                        themeColor={`gray.${key}`}
                        hexValue={hex}
                        description={description[key] || null}
                      />
                    );
                  },
                )}
              </Flex>
            </Box>
            <Box>
              <Heading as='h5' size='h5' fontFamily='body' my={2}>
                Global
              </Heading>
              <Flex direction={['column', 'row']} flexWrap='wrap'>
                {(Object.entries(theme.colors.niaid) as [string, string][]).map(
                  ([key, hex]) => {
                    if (hex === '') {
                      return;
                    }

                    // Text labels
                    const description: {
                      [key: string]: string;
                    } = {
                      '50': 'Page Background',
                      '100': 'Page Background Alt',
                      '200': 'Placeholder',
                      '500': 'Link',
                      '600': 'NIAID color',
                      '800': 'Body (text)',
                      '900': 'Heading (text)',
                    };
                    return (
                      <ColorSwatch
                        key={key}
                        themeColor={`niaid.${key}`}
                        hexValue={hex}
                        description={description[key] || null}
                      />
                    );
                  },
                )}
              </Flex>
            </Box>
            <Box>
              <Heading as='h5' size='h5' fontFamily='body' my={2}>
                {'Status & Alert'}
              </Heading>
              <Flex direction={['column', 'row']} flexWrap='wrap'>
                {(
                  Object.entries(theme.colors.nde.status) as [string, string][]
                ).map(([key, hex]) => {
                  if (hex === '') {
                    return;
                  }
                  // Text labels
                  const description: {
                    [key: string]: string;
                  } = {
                    success: 'Severity 4',
                    alert: 'Severity 3',
                    warning: 'Severity 2',
                    error: 'Severity 1',
                    info: 'Information',
                  };
                  return (
                    <ColorSwatch
                      key={key}
                      themeColor={`nde.status.${key}`}
                      hexValue={hex}
                      description={description[key] || null}
                      flex={['0 1 10%', '0 1 10%', '0 1 10%', '1 1 10%']}
                    />
                  );
                })}
              </Flex>
            </Box>

            <Box>
              <Heading as='h5' size='h5' fontFamily='body' my={2}>
                Theme
              </Heading>
              <Flex direction={['column', 'row']} flexWrap='wrap'>
                {theme.colors.nde.primary && (
                  <>
                    <Heading as='h6' size='sm' fontFamily='body' my={1}>
                      Primary
                    </Heading>
                    <Flex direction={['column', 'row']} flexWrap='wrap'>
                      {/* Primary theme colors */}
                      {(
                        Object.entries(theme.colors.nde.primary) as [
                          string,
                          string,
                        ][]
                      ).map(([key, hex]) => {
                        return (
                          <ColorSwatch
                            key={key}
                            themeColor={`nde.primary.${key}`}
                            hexValue={hex}
                            minW={['100%', '150px', '20%']}
                          />
                        );
                      })}
                    </Flex>
                  </>
                )}
                {/* Secondary theme colors */}
                {theme.colors.nde.secondary && (
                  <>
                    <Heading as='h6' size='sm' fontFamily='body' my={1}>
                      Secondary
                    </Heading>
                    <Flex direction={['column', 'row']} flexWrap='wrap'>
                      {(
                        Object.entries(theme.colors.nde.secondary) as [
                          string,
                          string,
                        ][]
                      ).map(([key, hex]) => {
                        return (
                          <ColorSwatch
                            key={key}
                            themeColor={`nde.secondary.${key}`}
                            hexValue={hex}
                            minW={['100%', '150px', '20%']}
                          />
                        );
                      })}
                    </Flex>
                  </>
                )}

                {/* Navigation  colors */}
                {theme.colors.nde.navigation && (
                  <>
                    <Heading as='h6' size='sm' fontFamily='body' my={1}>
                      Navigation
                    </Heading>
                    <Flex
                      direction={['column', 'row']}
                      flexWrap='wrap'
                      w={'100%'}
                    >
                      {(
                        Object.entries(theme.colors.nde.navigation) as [
                          string,
                          string,
                        ][]
                      ).map(([key, hex]) => {
                        return (
                          <ColorSwatch
                            key={key}
                            themeColor={`nde.navigation.${key}`}
                            hexValue={hex}
                            description={`Navigation (${key})`}
                            minW={['100%', '150px', '20%']}
                          />
                        );
                      })}
                    </Flex>
                  </>
                )}

                {/* Accent  colors */}
                {theme.colors.nde.accent && (
                  <>
                    <Heading as='h6' size='sm' fontFamily='body' my={1}>
                      Accent
                    </Heading>
                    <Flex
                      direction={['column', 'row']}
                      flexWrap='wrap'
                      w={'100%'}
                    >
                      {(
                        Object.entries(theme.colors.nde.accent) as [
                          string,
                          string,
                        ][]
                      ).map(([key, hex]) => {
                        return (
                          <ColorSwatch
                            key={key}
                            themeColor={`nde.accent.${key}`}
                            hexValue={hex}
                            description={`Accent`}
                            minW={['100%', '150px', '20%']}
                          />
                        );
                      })}
                    </Flex>
                  </>
                )}

                {/* Text colors */}
                {theme.colors.nde.accent && (
                  <>
                    <Heading as='h6' size='sm' fontFamily='body' my={1}>
                      Text{' '}
                    </Heading>
                    <Flex
                      direction={['column', 'row']}
                      flexWrap='wrap'
                      w={'100%'}
                    >
                      {(
                        Object.entries(theme.colors.nde.text) as [
                          string,
                          string,
                        ][]
                      ).map(([key, hex]) => {
                        return (
                          <ColorSwatch
                            key={key}
                            themeColor={`nde.text.${key}`}
                            hexValue={hex}
                            description={`Text (${key})`}
                            minW={['100%', '150px', '20%']}
                          />
                        );
                      })}
                    </Flex>
                  </>
                )}
              </Flex>
            </Box>
          </Section>

          {/* Buttons */}
          <Section title='Buttons'>
            <Box py={2}>
              <Button variant='solid' m={1} colorScheme={'nde.primary'}>
                Solid Button
              </Button>
              <Button
                variant='solid'
                m={1}
                isDisabled
                colorScheme={'nde.primary'}
              >
                Disabled Button
              </Button>
              <Button variant='outline' m={1} colorScheme={'nde.primary'}>
                Outline Button
              </Button>
              <Button
                variant='outline'
                m={1}
                isDisabled
                colorScheme={'nde.primary'}
              >
                Disabled Button
              </Button>
              <Text fontSize='xs'>Primary Buttons</Text>
            </Box>

            <Box py={2}>
              <Button variant='solid' m={1} colorScheme='nde.secondary'>
                Solid Button
              </Button>
              <Button
                variant='solid'
                m={1}
                isDisabled
                colorScheme='nde.secondary'
              >
                Disabled Button
              </Button>
              <Button variant='outline' m={1} colorScheme='nde.secondary'>
                Outline Button
              </Button>
              <Button
                variant='outline'
                m={1}
                colorScheme='nde.secondary'
                isDisabled
              >
                Disabled Button
              </Button>
              <Text fontSize='xs'>Secondary Buttons</Text>
            </Box>

            <Box py={2}>
              <Button variant='solid' m={1} colorScheme={'gray'}>
                Solid Button
              </Button>
              <Button variant='solid' m={1} isDisabled colorScheme={'gray'}>
                Disabled Button
              </Button>
              <Button variant='outline' m={1} colorScheme={'gray'}>
                Outline Button
              </Button>
              <Button variant='outline' m={1} isDisabled colorScheme={'gray'}>
                Disabled Button
              </Button>
              <Text fontSize='xs'>Default</Text>
            </Box>

            <Box py={2}>
              <Button variant='solid' m={1} colorScheme='red'>
                Solid Button
              </Button>
              <Button variant='solid' m={1} isDisabled colorScheme='red'>
                Disabled Button
              </Button>
              <Button variant='outline' m={1} colorScheme='red'>
                Outline Button
              </Button>
              <Button variant='outline' m={1} colorScheme='red' isDisabled>
                Disabled Button
              </Button>
              <Text fontSize='xs'>Red Buttons</Text>
            </Box>
          </Section>

          {/* Link */}
          <Section title='Link'>
            <Link href='/a'>
              <Text>This is a link</Text>
            </Link>
            <br />
            <Link href='/b' variant={'underline'}>
              <Text>This is an underline variant link</Text>
            </Link>
            <br />
            <Link href='/c' isExternal>
              <Text>This is an external link</Text>
            </Link>
            <br />
            <Link href='/'>
              This is a link to a document or pdf
              <Icon lineHeight={1.3} as={FaRegFile} w={3} h={4} ml={2} />
            </Link>
          </Section>

          {/* Icons */}
          <Section title='Icons'>
            <Flex flexWrap='wrap'>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegUser} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegUser
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegPaperPlane} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegPaperPlane
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegImage} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegImage
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegHeart} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegHeart
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegComment} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegComment
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegCheckCircle} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegCheckCircle
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegEdit} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegEdit
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegTrashAlt} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegTrashAlt
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegEnvelope} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegEnvelope
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegThumbsUp} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegThumbsUp
                </Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={1}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
              >
                <Icon as={FaRegCompass} boxSize={6} m={2} />
                <Text fontSize='xs' isTruncated w='100%' textAlign='center'>
                  FaRegCompass
                </Text>
              </Flex>
            </Flex>
          </Section>

          {/* Shadows */}
          <Section title='Shadows'>
            <Heading my={2} size='h6' fontFamily='body'>
              Soft Shadows
            </Heading>
            <Flex flexWrap='wrap'>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={[1, 4]}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
                shadow='base'
              >
                <Text>Base</Text>
              </Flex>
            </Flex>

            <Heading my={2} size='h6' fontFamily='body'>
              Hard Shadows
            </Heading>

            <Flex flexWrap='wrap'>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={[1, 4]}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
                shadow='low'
              >
                <Text>Low</Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={[1, 4]}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
                shadow='md'
              >
                <Text>Md</Text>
              </Flex>
              <Flex
                flex='0 1 25%'
                minW={['100%', 'unset']}
                m={[1, 4]}
                border='1px solid'
                borderRadius='base'
                borderColor='gray.100'
                direction='column'
                alignItems='center'
                p={2}
                shadow='high'
              >
                <Text>High</Text>
              </Flex>
            </Flex>
          </Section>

          {/**
           * Components
           */}
          <Section title='Component: Search Result Card'>
            <SearchResultCard
              title='Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.'
              accessType='restricted'
              sourceDetails={{
                id: 'zenodo.5594016',
                name: 'Zenodo',
                imageUrl:
                  'https://zenodo.org/static/img/logos/zenodo-gradient-round.svg',
                url: 'https://zenodo.org/record/5594016',
              }}
              authorDetails={[
                {
                  orcid: 'https://orcid.org/0000-0001-8079-6739',
                  affiliation: {
                    name: 'Molecular Diagnostics and Phenome Research Unit',
                  },
                  name: 'Dinesh Kumar',
                },
                {
                  orcid: 'https://orcid.org/0000-0003-2788-6465',
                  affiliation: {
                    name: 'Molecular Diagnostics and Phenome Research Unit',
                  },
                  name: 'Ritu Raj',
                },
                {
                  orcid: 'https://orcid.org/0000-0002-7360-4994',
                  affiliation: {
                    name: 'Molecular Diagnostics and Phenome Research Unit',
                  },
                  name: 'Durgesh Dubey',
                },
              ]}
              description={`<p>Tuberculosis (TB) -a pulmonary granulomatous disease- is the leading cause of death worldwide from a single infectious disease agent especially in developing countries such as India. Current diagnostic methodologies often lack specificity and sensitivity; therefore, there is an immense clinical interest to investigate alternative biomarker signatures for obtaining a conclusive and suggestive diagnosis of TB. Particular challenge arises for treating physicians while differentiating TB from sarcoidosis (SAR) which is an uncommon granulomatous disease and shares the similar clinical, radiological and pathological features with TB. Symptoms common in TB such as cough, fever, fatigue, and weight-loss are often manifested in sarcoidosis as well. As India accounts for more than 26% of global burden of TB cases and epidemiological data about sarcoidosis is unknown, most of the sarcoidosis patients end up receiving anti tubercular therapy (ATT) erroneously, leading to delayed proper treatment and considerable risk of drug induced toxicity, whereas lung damage continues to progress in this backdrop. Therefore, there is an urgent unmet need to identify non-invasive biomarker(s) for differentiating sarcoidosis from TB. Metabolomics analysis of serum holds great potential to provide distinctive patterns of metabolic profiles relevant to underlying disease processes and thus may aid in rapid clinical diagnosis and guiding appropriate treatment.</p>

                <p>Starting our efforts in this direction, the serum metabolic profiles&nbsp;of sarcoidosis and active TB patients were&nbsp;measured using 800 MHz NMR Spectroscopy and compared using the multivariate and univariate statistical analysis tools. The partial least square discriminatory analysis (PLS-DA) revealed significant serum metabolic disparity between SAR and TB with respect to normal control subjects [1-5].&nbsp;Compared to SAR, the sera of TB patients were characterized by (a) elevated levels of lactate, acetate, 3-hydroxybutyrate (3HB), glutamate and succinate (b) decreased levels of glucose, citrate, pyruvate, glutamine, and various lipid and membrane metabolites (such as very-low/low density lipoproteins (VLDL/LDL), polyunsaturated fatty acids, etc.).</p>

                <p>The altered circulatory levels of glucose (decreased) and lactate (increased) were found well consistent with previous report [6] demonstrating that infection with Mycobacterium tuberculosis (MTb) induces the Warburg effect in mouse lungs. A very recent study reported increased production of glutamate from mitochondrial glutaminolysis and pleiotropic roles of glutamine metabolism in the metabolic reprogramming of MTb infected M1-like macrophages [7]. A previous study published in Science [8] reported the suppression of oxidative stress by 3HB. Another study published in scientific report demonstrated that of <em>Mycobacterium tuberculosis</em> (MTb) secretory protein ESAT-induces GLUT-1 mediated enhanced glucose uptake by macrophages and increased fatty acid biosynthesis (to drive foamy macrophage differentiation) which in turn results in release of 3HB in the extracellular environment [9]. Based on previously reported metabolic derangements in MTb infected systems and our results derived from NMR-based serum metabolomics, the following remarks have been drawn:</p>

                <ul>
                  <li><strong>Active TB infection </strong>induces Warburg effect as inferred from the decreased serum levels of glucose and elevated levels of lactate</li>
                  <li><strong>Active TB infection </strong>causes increased biosynthesis of fatty acids as inferred from the decreased serum levels of citrate and increased levels of acetate and 3-Hydroxybutyrate (3-HB)</li>
                  <li><strong>Active TB infection </strong>manipulates oxidative stress (OS) induced pathogen killing host-defense mechanism as inferred from decreased circulatory phenylalanine-to-tyrosine ratio (PTR) and 3HB (known to suppress OS)</li>
                  <li><strong>Active TB infection </strong>induces augmented utilization of glutamine (an immunomodulatory nutrient) as inferred from the decreased serum levels of glutamine and increased serum levels of glutamate and succinate</li>
                  <li><strong>Active TB infection </strong>induces&nbsp;dyslipidemia as inferred from the decreased NMR signals of very-low/low density lipoproteins (VLDL/LDL) and polyunsaturated fatty acids (PUFAs)</li>
                </ul>

                <p><strong>References:</strong></p>

                <ol>
                  <li>Dinesh Kumar, Ritu Raj, Avinash Jain , Anupam Guleria, Umesh Kumar, Mohit K Rai, Harshit Singh, Saurabh Chaturvedi, Alok Nath, Durga P Misra and Vikas Agarwal, &ldquo;Serum based metabolomics analysis revealed highly sensitive and specific panel of metabolic markers for differential diagnosis of Pulmonary Sarcoidosis and Tuberculosis&rdquo; (Conference paper presented during IRACON-2018). F1000Research 2019, 8:304 (DOI: 10.7490/f1000research.1116481.1)</li>
                  <li>Dinesh Kumar, Avinash Jain, Amit Kumar, Anupam Guleria, Ritu Raj, Harshit Singh, Mohit K Rai, Saurabh Chaturvedi, Alok Nath, Durga P Misra, and Vikas Agarwal, &ldquo;Targeted nuclear magnetic resonance-based serum metabolomics analysis revealed significantly higher phenylalanine/tyrosine ratio in pulmonary sarcoidosis patients compared to tuberculosis patients&rdquo;, (Conference Paper selected for Oral Presentation in IRACON 2018: OPC0034) Indian J Rheumatol (2018), vol 13 (Issue 6) Suppl S2:79-92 (DOI: 10.4103/0973-3698.247335)</li>
                  <li>Avinash Jain, Amit Kumar, Harshit Singh, Mohit Kumar Rai, Saurabh Chaturvedi, Anupam Guleria, Alok Nath, Dinesh Kumar, Durga Prasanna Misra, and Vikas Agarwal, &ldquo;Nuclear magnetic resonance (NMR) based Serum Metabolomics in Sarcoidosis and Tuberculosis &ndash; Search for a Biomarker&rdquo;, (Received Best Oral Award) (Conference Paper selected for Oral Presentation in IRACON 2018: OPC0030) Indian J Rheumatol (2018), vol 13 (Issue 6) Suppl S2:79-92&nbsp; (DOI: 10.4103/0973-3698.247335).</li>
                  <li>Dinesh Kumar, Avinash Jain, Amit Kumar, Anupam Guleria, Alok Nath, Durga Prasanna Misra, Vikas Agarwal, &ldquo;Diagnostic panel of biomarkers for the assessment of sarcoidosis and tuberculosis identified using NMR based serum metabolomics approach&rdquo; (Poster Presented during BSRAC-2018) F1000Research (2018), 7:18 (doi: 10.7490/f1000research.1115194.1)</li>
                  <li>Avinash Jain, Amit Kumar, Harshit Singh, Mohit K Rai, Saurabh Chaturvedi, Anupam Guleria, Alok Nath, Dinesh Kumar, Durga P Misra and Vikas Agarwal, &ldquo;Nuclear magnetic resonance (NMR) based serum metabolomics in sarcoidosis and tuberculosis: search for a biomarker&rdquo; (Poster Presentation during British Society for Rheumatology Annual Conference 2018 | BSRAC-2018) Rheumatology (April 2018), Vol 57, Issue suppl_3 (DOI: 10.1093/rheumatology/key075.338).</li>
                  <li>Shi, L., Salamon, H., Eugenin, E.A., Pine, R., Cooper, A. and Gennaro, M.L., 2015. Infection with Mycobacterium tuberculosis induces the Warburg effect in mouse lungs. Scientific reports, 5(1), pp.1-13.</li>
                  <li>Jiang, Qingkui, and Lanbo Shi. &quot;Coordination of the uptake and metabolism of amino acids in Mycobacterium tuberculosis-infected macrophages.&quot; Frontiers in Immunology 12 (2021).</li>
                  <li>Shimazu, T., Hirschey, M.D., Newman, J., He, W., Shirakawa, K., Le Moan, N., Grueter, C.A., Lim, H., Saunders, L.R., Stevens, R.D. and Newgard, C.B., 2013. Suppression of oxidative stress by &beta;-hydroxybutyrate, an endogenous histone deacetylase inhibitor.&nbsp;<em>Science</em>,&nbsp;<em>339</em>(6116), pp.211-214.</li>
                  <li>Singh, V., Kaur, C., Chaudhary, V.K., Rao, K.V. and Chatterjee, S., 2015. M. tuberculosis secretory protein ESAT-6 induces metabolic flux perturbations to drive foamy macrophage differentiation.&nbsp;<em>Scientific reports</em>,&nbsp;<em>5</em>(1), pp.1-12.</li>
                </ol>`}
              keywords={[
                'Tuberculosis',
                'drug-resistant tuberculosis',
                'TB drug discovery',
                'drug response prediction',
                'drug combinations',
                'drug synergy',
                'novel TB-treatment regimens',
                'computational model',
                'machine learning',
              ]}
            />
          </Section>
          <Section title='Component: Search Bar'>
            <SearchBar />
          </Section>
        </Flex>
      </Flex>
    </div>
  );
};

export default Styleguide;
