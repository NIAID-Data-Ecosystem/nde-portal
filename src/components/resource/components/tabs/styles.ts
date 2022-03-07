import {Heading, HeadingProps, Tab, TabProps} from 'nde-design-system';
import styled from '@emotion/styled';

export const StyledTab = styled(Tab)<TabProps>(props => ({}));

StyledTab.defaultProps = {
  minW: 150,
  _selected: {
    bg: 'white',
    border: '1px solid',
    borderColor: 'gray.200',
    borderTopLeftRadius: 'md',
    borderTopRightRadius: 'md',
    borderBottomColor: 'white',
    borderTop: '4px solid',
    borderTopColor: 'accent.bg',
    color: 'primary.500',
  },
};
