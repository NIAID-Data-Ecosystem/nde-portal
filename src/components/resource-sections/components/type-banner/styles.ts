import { Flex, FlexProps } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { system } from 'src/theme';

/*
 * The colour is read off the system rather than `props.theme`. Under Chakra v2
 * the provider also installed an Emotion `ThemeProvider`, so `props.theme.colors`
 * happened to be the Chakra theme; v3's provider does not, which would silently
 * make that `undefined`.
 */
export const StyledLabel = styled(Flex)<FlexProps>`
  display: inline-flex;
  line-height: 1.5;
  position: relative;
  z-index: 0;
  &:before {
    content: '';
    background-color: ${(props: any) =>
      props._before?.bg || system.token('colors.info')};
    box-shadow: 0 0 0 5px #fff;
    display: block;
    height: 2.5rem;
    left: 0;
    position: absolute;
    top: 0;
    transform: skew(-12deg);
    width: 100%;
    z-index: -4;
  }
`;
StyledLabel.defaultProps = {
  mx: 2,
  p: 2,
};
