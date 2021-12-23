import {Styles} from '@chakra-ui/theme-tools';

// Global css styles.
// NOTE: import mode from @chakra-ui/theme-tools for dark mode.
const styles: Styles = {
  global: () => ({
    '*': {
      listStyleType: 'none',
    },
    body: {
      fontFamily: 'body',
      color: 'nde.text.body',
      fontSize: '16px',
      lineHeight: 'base',
    },
  }),
};

export default styles;
