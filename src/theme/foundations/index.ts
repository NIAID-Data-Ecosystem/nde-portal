import { colors } from './colors';
import radii from './radius';
import shadows from './shadows';
import typography from './typography';

const foundations = {
  colors,
  shadows,
  radii,
  ...typography,
} as any;

export default foundations;
