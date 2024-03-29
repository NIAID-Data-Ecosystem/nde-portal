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
    heading: 'var(--font-public-sans)',
    body: 'var(--font-public-sans)',
  },
  styles,
};

export const theme = extendTheme(overrides);
