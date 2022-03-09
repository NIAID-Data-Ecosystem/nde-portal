import {Heading, HeadingProps, Tab} from 'nde-design-system';
import styled from '@emotion/styled';

export const StyledTab = styled(Tab)(props => ({}));

StyledTab.defaultProps = {
  minW: 150,
  borderRadius: 'md',
  px: 6,
  py: 3,
  m: 1,
  lineHeight: 'normal',
};
