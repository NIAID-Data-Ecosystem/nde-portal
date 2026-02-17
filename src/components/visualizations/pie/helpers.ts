// Helper to calculate max label width in pixels based on available space.
export const getMaxLabelWidthPx = ({
  horizontalAnchor,
  labelX,
  svgWidth,
  groupLeft,
  minWidth = 20,
  edgePadding = 8, // padding from edge of SVG
  maxWidthCap,
}: {
  horizontalAnchor: 'start' | 'end';
  labelX: number;
  svgWidth: number;
  groupLeft: number;
  minWidth?: number;
  edgePadding?: number;
  maxWidthCap?: number;
}) => {
  // Convert label position from group space to absolute SVG space
  const labelAbsX = groupLeft + labelX;

  // SVG horizontal bounds
  const leftEdge = 0;
  const rightEdge = svgWidth;

  const available =
    horizontalAnchor === 'start' ? rightEdge - labelAbsX : labelAbsX - leftEdge;

  const raw = available - edgePadding;

  // Subtract edge padding and cap overly wide labels
  const capped = Math.min(raw, maxWidthCap ?? svgWidth * 0.45);

  return Math.max(minWidth, capped);
};
