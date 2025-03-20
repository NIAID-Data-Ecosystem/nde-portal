import { theme } from 'src/theme';

export const Badge = {
  baseStyle: {
    lineHeight: 'short',
  },
  variants: {
    solid: ({ colorScheme }: { colorScheme: string }) => {
      let bg;
      let color = 'white';
      if (colorScheme === 'niaid') {
        bg = 'black';
      }
      if (colorScheme === 'gray') {
        bg = 'gray.700';
      }
      if (colorScheme === 'success') {
        bg = 'status.success';
      }
      if (colorScheme === 'warning') {
        bg = 'status.warning';
        color = 'text.heading';
      }
      if (colorScheme === 'negative') {
        bg = 'status.error';
      }
      if (colorScheme === 'info') {
        bg = 'status.info';
      }
      return {
        bg,
        color,
      };
    },
    subtle: ({ colorScheme }: { colorScheme: string }) => {
      let bg;
      let color;

      if (colorScheme === 'success') {
        color = 'green.700';
        bg = 'status.success_lt';
      }
      if (colorScheme === 'warning') {
        color = 'yellow.700';
        bg = 'status.warning_lt';
      }
      if (colorScheme === 'negative') {
        color = 'red.600';
        bg = 'status.error_lt';
      }
      if (colorScheme === 'info') {
        color = 'status.info';
        bg = 'status.info_lt';
      }

      return {
        bg,
        color,
      };
    },
    outline: ({ colorScheme }: { colorScheme: string }) => {
      let boxShadow;
      let color;
      if (colorScheme === 'gray') {
        boxShadow = theme.colors.gray[900];
        color = theme.colors.gray[700];
      }
      if (colorScheme === 'niaid') {
        boxShadow = theme.colors.black;
        color = theme.colors.text.heading;
      }
      if (colorScheme === 'success') {
        boxShadow = theme.colors.status.success;
        color = theme.colors.status.success;
      }
      if (colorScheme === 'warning') {
        boxShadow = theme.colors.status.warning;
        color = theme.colors.yellow[700];
      }
      if (colorScheme === 'negative') {
        boxShadow = theme.colors.status.error;
        color = theme.colors.status.error;
      }
      if (colorScheme === 'info') {
        boxShadow = theme.colors.status.info;
        color = theme.colors.status.info;
      }

      return {
        boxShadow: boxShadow && `inset 0 0 0px 1px ${boxShadow}`,
        color,
      };
    },
  },

  defaultProps: {
    variant: 'subtle',
    fontWeight: 'semibold',
    fontSize: '12px',
  },
};
