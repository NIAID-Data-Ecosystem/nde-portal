import {
  Box,
  BoxProps,
  Flex,
  FlexProps,
  Link,
  LinkProps,
  theme,
} from 'nde-design-system';
import styled from '@emotion/styled';
import {css} from '@emotion/react';

const StyledNavigation = styled(Flex)<FlexProps>(() => ({}));
StyledNavigation.defaultProps = {
  position: 'sticky',
  alignItems: 'center',
  w: '100%',
  zIndex: 50,
};

const StyledNavigationContent = styled(Flex)<FlexProps>(() => ({}));
StyledNavigationContent.defaultProps = {
  position: 'relative',
  direction: 'column',
  top: 0,
  left: 0,
  w: '100%',
};

const StyledNavigationBar = styled(Flex)<FlexProps>`
  color: #fff;
  position: relative;
  letter-spacing: 1.4px;

  &:before {
    content: '';
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform: skew(-12deg);
    width: 100%;
    z-index: -4;
  }
`;
StyledNavigationBar.defaultProps = {
  borderTop: '1px',
  borderBottom: '1px',
  borderColor: 'gray.300',
  alignItems: 'center',
  py: [2, 2, 0],
  px: [2, 4],
  w: '100%',
};

const StyledNavigationLinks = styled(Box)<BoxProps>(() => ({}));
StyledNavigationLinks.defaultProps = {
  position: ['absolute', 'absolute', 'unset'],
  left: 0,
  bottom: 0,
  transform: [`translate(0,100%)`, `translate(0,100%)`, `translate(0,0%)`],
  boxShadow: 'sm',
  w: ['100%', '100%', '100%'],
  h: '100%',
};

interface StyledLinkProps extends LinkProps {
  isSelected?: boolean;
}
const StyledLink = styled(Link)<StyledLinkProps>`
  border-bottom: 4px solid !important;
  border-color: transparent !important;
  padding-top: 0.5rem !important;
  padding-bottom: 0.25rem !important;
  &:hover {
    text-decoration: underline;
  }
  ${props =>
    props.isSelected &&
    css`
      * {
        color: ${theme.colors.primary[900]}!important;
      }
      border-bottom: 4px solid !important;
      border-color: ${theme.colors.accent.bg}!important;
      &:hover {
        text-decoration: none;
      }
    `};
`;
StyledLink.defaultProps = {
  px: 4,
  height: '100%',
  alignItems: 'center',
  variant: 'unstyled',
};

const StyledResourceType = styled(Flex)<FlexProps>`
  color: #fff;
  display: inline-flex;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.1;
  position: relative;
  text-transform: uppercase;
  z-index: 9;
  letter-spacing: 1.4px;

  &:before {
    background-color: ${theme.colors.status.info};
    box-shadow: 0 0px 0 5px #fff;
    content: '';
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform: skew(-12deg);
    width: 100%;
    z-index: -4;
  }
`;
StyledResourceType.defaultProps = {
  px: 4,
  py: 1,
};

export {
  StyledNavigation,
  StyledNavigationContent,
  StyledNavigationBar,
  StyledNavigationLinks,
  StyledLink,
  StyledResourceType,
};
