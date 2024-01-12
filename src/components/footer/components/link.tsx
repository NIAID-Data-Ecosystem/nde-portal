import React from 'react';
import { Icon, Flex } from '@chakra-ui/react';
import { FaAngleRight, FaGithub, FaRegEnvelope } from 'react-icons/fa6';
import { FooterProps } from '..';
import { Link, LinkProps } from 'src/components/link';

export const StyledLink = ({ ...props }: LinkProps) => {
  return (
    <Link
      display='inline'
      my={0}
      color='white'
      _visited={{ color: 'white' }}
      _hover={{ color: 'white' }}
      {...props}
    />
  );
};

interface FooterLinkProps extends LinkProps {
  href: string;
  isExternal?: boolean;
}

export const FooterLink: React.FC<FooterLinkProps> = ({
  children,
  isExternal,
  href,
  ...props
}) => {
  return (
    <>
      <StyledLink href={href} isExternal={isExternal ?? false} {...props}>
        {children}
      </StyledLink>
      {!isExternal && (
        <Icon
          as={FaAngleRight}
          boxSize={3}
          ml={2}
          color='accent.bg'
          transform='translate(-5px)'
          transition='all .3s ease'
        />
      )}
    </>
  );
};

export const FooterSocialLinks = ({
  routes,
}: {
  routes:
    | FooterProps['navigation']['contact']['routes']
    | FooterProps['navigation']['lastUpdate'];
}) => {
  if (!routes) {
    return null;
  }

  return (
    <>
      {routes &&
        routes.map(route => {
          if (!route?.href) {
            return;
          }
          const { label, type, href, isExternal } = route;
          return (
            <Flex
              key={label}
              alignItems='center'
              justifyContent='inherit'
              px={4}
              mt={{ base: 1, md: 0 }}
              mb={{ base: 3, md: 0 }}
            >
              {type?.toLowerCase().includes('email') && (
                <Icon as={FaRegEnvelope} boxSize={4} mx={2} />
              )}
              {type?.toLowerCase().includes('github') && (
                <Icon as={FaGithub} boxSize={4} mx={2} />
              )}
              <StyledLink
                href={href}
                fontSize='sm'
                w='unset'
                isExternal={isExternal}
                whiteSpace='nowrap'
              >
                {label}
              </StyledLink>
            </Flex>
          );
        })}
    </>
  );
};
