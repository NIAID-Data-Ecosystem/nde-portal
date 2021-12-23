import {Box, Heading, Flex, Link, Icon, Text, Button} from '@chakra-ui/react';
import type {NextPage} from 'next';
import Head from 'next/head';
import {
  Navigation,
  Section,
  Typography,
  ColorSwatch,
} from 'src/components/styleguide';
import {theme} from 'src/theme';
import {
  FaExternalLinkAlt,
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
            <Heading fontSize='xs' fontFamily='body' my={3} color='niaid.800'>
              COMPONENTS
            </Heading>
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
            <Link href='/'>This is a link</Link>
            <br />
            <Link href='/' isExternal>
              This is an external link
              <Icon as={FaExternalLinkAlt} boxSize={3} ml={2} />
            </Link>
            <br />
            <Link href='/' isExternal>
              This is a link to a document or pdf
              <Icon as={FaRegFile} boxSize={4} ml={2} />
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
        </Flex>
      </Flex>
    </div>
  );
};

export default Styleguide;
