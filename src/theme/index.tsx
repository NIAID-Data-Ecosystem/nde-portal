import { extendTheme } from '@chakra-ui/react';
import foundations from './foundations';
import styles from './styles';
import { Badge } from './components/badge.theme';
import { Button } from './components/button.theme';
import Card from './components/card.theme';
import { Input } from './components/input.theme';
import { Link } from './components/link.theme';
import { Heading } from './components/heading.theme';
import { Text } from './components/text.theme';
import { Table } from './components/table.theme';
import { Tag } from './components/tag.theme';
import { Public_Sans } from 'next/font/google';

// Import the weights and subsets, add any other config here as well
export const public_sans_font = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['arial', 'system-ui'],
});

interface ThemeConfig {
  cssVarPrefix?: string;
}

const config: ThemeConfig = {
  cssVarPrefix: 'chakra',
};

// Overrides to Chakra-UI theme object
const overrides = {
  ...foundations,
  components: {
    Badge,
    Button,
    Card,
    Heading,
    Input,
    Link,
    Table,
    Tag,
    Text,
  },
  config,
  fonts: {
    body: public_sans_font.style.fontFamily,
    heading: public_sans_font.style.fontFamily,
  },
  styles,
};

export const theme = extendTheme(overrides);
