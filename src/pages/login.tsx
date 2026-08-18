import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  List,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import {
  FaCheck,
  FaGithub,
  FaGoogle,
  FaMicrosoft,
  FaOrcid,
} from 'react-icons/fa6';
import { useRouter } from 'next/router';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { useAuth } from 'src/hooks/useAuth';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

const ListItemContent = ({ children }: { children: React.ReactNode }) => (
  <HStack alignItems='center' gap={4} lineHeight='short'>
    <Icon boxSize={4} aria-hidden='true' color='niaid.500' asChild>
      <FaCheck />
    </Icon>

    <Text fontSize='inherit'>{children}</Text>
  </HStack>
);

const ProviderIcon = ({ providerId }: { providerId: string }) => {
  if (providerId.toLowerCase() === 'orcid') {
    return (
      <Icon color='#A6CE39' boxSize={5} aria-hidden='true' asChild>
        <FaOrcid />
      </Icon>
    );
  }

  if (providerId.toLowerCase() === 'github') {
    return (
      <Icon color='#24292e ' boxSize={5} aria-hidden='true' asChild>
        <FaGithub />
      </Icon>
    );
  }

  if (providerId.toLowerCase() === 'google') {
    return (
      <Icon color='#4285F4' boxSize={5} aria-hidden='true' asChild>
        <FaGoogle />
      </Icon>
    );
  }

  if (providerId.toLowerCase() === 'microsoft') {
    return (
      <Icon color='#00A4EF' boxSize={5} aria-hidden='true' asChild>
        <FaMicrosoft />
      </Icon>
    );
  }

  return (
    <Box
      aria-hidden='true'
      boxSize='16px'
      borderRadius='full'
      bg='gray.400'
      display='inline-block'
    />
  );
};

function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loginProviders, login } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnTo =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('auth_return_to') || '/'
          : '/';
      router.replace(returnTo);
    }
  }, [isAuthenticated, isLoading, router]);

  // If auth is disabled via feature flag, redirect to home page
  React.useEffect(() => {
    if (!ENABLE_AUTH) {
      router.replace('/');
    }
  }, [router]);

  if (!ENABLE_AUTH) {
    return null;
  }

  return (
    <PageContainer meta={getPageSeoConfig('/login')} px={0} py={0}>
      <Flex
        minH={{ base: 'auto', lg: '80vh' }}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <Flex
          flex='1'
          alignItems='center'
          justifyContent='center'
          flexDirection='column'
          px={{ base: 4, md: 10 }}
          py={{ base: 10, lg: 16 }}
          bg='#fff'
          position='relative'
          overflow='hidden'
        >
          <Image
            src='/assets/homepage/ecosystem-hero-nodes.png'
            alt=''
            aria-hidden='true'
            position='absolute'
            bottom={{ base: '-80%', lg: '-35%' }}
            left={{ base: '-10%', lg: '-5%' }}
            width={{ base: '1000px', lg: '1200px' }}
            transform='rotate(20deg)'
            opacity={0.25}
            pointerEvents='none'
            zIndex={0}
            maxWidth='unset'
          />
          <Heading
            as='h1'
            size='md'
            mb={4}
            color='text.heading'
            fontWeight='semibold'
            zIndex={1}
          >
            Log in to your account
          </Heading>
          <Box
            w='100%'
            maxW={{ base: '500px', lg: '350px' }}
            textAlign='center'
            bg='whiteAlpha.800'
            border='1px'
            borderColor='gray.100'
            borderRadius='6px'
            boxShadow='sm'
            p={{ base: 6, md: 8 }}
            zIndex={1}
          >
            {isLoading ? (
              <Stack align='center' py={4}>
                <Spinner color='niaid.500' />
                <Text color='gray.700'>Checking authentication status...</Text>
              </Stack>
            ) : (
              <Stack gap={3} maxW='260px' mx='auto'>
                {loginProviders.map(provider => (
                  <Button
                    key={provider.id}
                    colorPalette='gray'
                    variant='outline'
                    size='md'
                    py={1}
                    borderColor='gray.100'
                    _hover={{
                      bg: 'niaid.50',
                      borderColor: 'niaid.300',
                    }}
                    _active={{
                      bg: 'niaid.50',
                      borderColor: 'niaid.300',
                    }}
                    onClick={() => login(provider.id)}
                  >
                    <HStack gap={2} justify='flex-start'>
                      <ProviderIcon providerId={provider.id} />
                      <Text fontSize='inherit'>
                        Log In With {provider.label}
                      </Text>
                    </HStack>
                  </Button>
                ))}
              </Stack>
            )}
            {/*
            <Text mt={5} fontSize='sm' color='gray.700'>
              Don&apos;t have an account?{' '}
              <Link
                href='/register'
                color='niaid.700'
                textDecoration='underline'
              >
                Register
              </Link>
            </Text> */}
          </Box>
        </Flex>

        <Flex
          width={{ base: '100%', lg: '46%' }}
          px={{ base: 4, md: 8, lg: 10 }}
          py={{ base: 8, lg: 14 }}
          bg='page.alt'
          alignItems='center'
          fontSize='md'
        >
          <Box
            width='100%'
            maxWidth='540px'
            mx={{ base: 'auto', lg: 0 }}
            p={{ base: 6, md: 8 }}
            color='gray.700'
          >
            <Image
              src='/assets/logos/niaid-nde-desktop-color.svg'
              alt='NIAID Data Ecosystem'
              maxW='330px'
              w='100%'
              mb={8}
            />

            <Stack gap={6} fontSize='inherit' lineHeight='tall'>
              <Text>
                The NIAID Data Ecosystem Discovery Portal is a project from the
                National Institute of Allergy and Infectious Diseases (NIAID) to
                help researchers find and access immune-mediated and infectious
                disease data, regardless of where the data is stored.
              </Text>
              <Text>
                The Discovery Portal provides a centralized interface to explore
                resources spanning genomics, proteomics, clinical research, and
                more.
              </Text>
            </Stack>

            <Heading
              as='h2'
              fontSize='md'
              mt={10}
              mb={4}
              color='text.heading'
              fontWeight='medium'
            >
              Why create a user account?
            </Heading>

            <List.Root gap={3} color='gray.700' fontSize='inherit'>
              <List.Item>
                <ListItemContent>
                  Save and re-visit selected datasets
                </ListItemContent>
              </List.Item>
              <List.Item>
                <ListItemContent>
                  Personalize your sitewide preferences
                </ListItemContent>
              </List.Item>
              <List.Item>
                <ListItemContent>
                  Opt in to experimental features
                </ListItemContent>
              </List.Item>
            </List.Root>

            <Link
              href='/about'
              textDecoration='underline'
              display='inline-block'
              mt={5}
            >
              Read More
            </Link>
          </Box>
        </Flex>
      </Flex>
    </PageContainer>
  );
}

export default LoginPage;

export function getStaticProps() {
  return { props: {} };
}
