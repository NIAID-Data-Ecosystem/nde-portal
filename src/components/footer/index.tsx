import React, {ReactNode} from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Icon,
  VisuallyHidden,
  chakra,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  FaTwitter,
  FaInstagram,
  FaExternalLinkAlt,
  FaFacebookF,
  FaLinkedin,
} from 'react-icons/fa';
import {StyledLink} from './styles';
import {NavItem} from 'src/components/page-container';

interface FooterProps {
  navItems: Array<NavItem>;
  footerItems: Array<NavItem>;
}

// Header for footer section
const ListHeader = ({children}: {children: ReactNode}) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

// Social media icon buttons
const SocialButton = ({
  children,
  label,
  href,
  bg,
}: {
  children: ReactNode;
  label: string;
  href: string;
  bg?: string;
}) => {
  return (
    <chakra.button
      bg={bg ?? 'whiteAlpha.100'}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        boxShadow: 'md',
      }}
    >
      {/* For accessibility */}
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const Footer: React.FC<FooterProps> = ({navItems, footerItems}) => {
  const isMobile = useBreakpointValue({base: true, md: false});
  return (
    <Box bg={'gray.900'} color={'white'}>
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{base: 1, sm: 2, md: 3}} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>Discovery Portal</ListHeader>
            {navItems.map(({href, label, routes}) => {
              return (
                <React.Fragment key={label}>
                  {href ? (
                    <Box>
                      <StyledLink href={href}>{label}</StyledLink>
                    </Box>
                  ) : (
                    <>
                      <Text fontWeight={'semibold'}>{label}</Text>
                      {routes &&
                        routes.map(route => (
                          <Box>
                            <StyledLink key={route.label} href={route.href}>
                              {route.label}
                            </StyledLink>
                          </Box>
                        ))}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </Stack>

          {footerItems.map(({href, label, routes, isExternal}) => {
            return (
              <Stack key={label} align={'flex-start'}>
                {href ? (
                  <StyledLink href={href} isExternal={isExternal ?? false}>
                    {label}
                    {isExternal && (
                      <Icon as={FaExternalLinkAlt} boxSize={3} ml={2} />
                    )}
                  </StyledLink>
                ) : (
                  <>
                    <ListHeader>{label}</ListHeader>
                    {routes &&
                      routes.map(route => (
                        <Box>
                          <StyledLink
                            key={route.label}
                            href={route.href}
                            isExternal={route.isExternal ?? false}
                          >
                            {route.label}
                            {route.isExternal && (
                              <Icon as={FaExternalLinkAlt} boxSize={3} ml={2} />
                            )}
                          </StyledLink>
                        </Box>
                      ))}
                  </>
                )}
              </Stack>
            );
          })}
        </SimpleGrid>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        bg={'niaid.900'}
        borderColor={'gray.700'}
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{base: 'column', md: 'row'}}
          spacing={4}
          justify={{md: 'space-between'}}
          align={{md: 'center'}}
        >
          <Box flex={1} maxW={'300px'}>
            <Image
              src={
                isMobile
                  ? '/assets/logos/nde-logo-acronym-white.svg'
                  : '/assets/logos/nde-logo-white.svg'
              }
              alt={'Niaid data ecosystem logo'}
            ></Image>
          </Box>
          <Stack direction={'row'} spacing={6}>
            <Text>Connect with Us</Text>
            <SocialButton label={'Facebook'} href={'#'} bg={'facebook.500'}>
              <Icon as={FaFacebookF} boxSize={4} />
            </SocialButton>
            <SocialButton label={'Twitter'} href={'#'} bg={'twitter.500'}>
              <Icon as={FaTwitter} boxSize={4} />
            </SocialButton>
            <SocialButton label={'LinkedIn'} href={'#'} bg={'linkedin.600'}>
              <Icon as={FaLinkedin} boxSize={4} />
            </SocialButton>
            <SocialButton label={'Instagram'} href={'#'} bg={'socials.ig'}>
              <Icon as={FaInstagram} boxSize={4} />
            </SocialButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};
export default Footer;
