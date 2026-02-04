import { ChartDatum } from 'src/views/search/components/summary/types';

export type TooltipEvt =
  | React.MouseEvent<Element>
  | React.PointerEvent<Element>
  | React.FocusEvent<Element>;

export interface BarChartProps {
  /** Width of the chart in pixels. @default 400 */
  width?: number;

  /** Height of the chart in pixels. @default 400 */
  height?: number;

  /** Array of data values used to generate the chart. */
  data: ChartDatum[];

  /** @default "{ top: 20, right: 20, bottom: 20, left: 20 }" */
  margin?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
  /** Whether to animate the chart transitions. @default true */
  animate?: boolean;

  /** Accessibilty title for the chart. */
  title: string;

  /** Accessibility description for the chart. */
  description: string;

  /** Callback when a slice is clicked. */
  onSliceClick?: (id: string) => void;

  useLogScale?: boolean;
  isExpanded?: boolean;
}
