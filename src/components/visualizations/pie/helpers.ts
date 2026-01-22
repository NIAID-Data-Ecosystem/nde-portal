export const getMaxLabelWidthPx = ({
  horizontalAnchor,
  labelX,
  outerRadius,
  margin,
  minWidth = 20,
  edgePadding = 2,
}: {
  horizontalAnchor: 'start' | 'end';
  labelX: number;
  outerRadius: number;
  margin: { top: number; right: number; bottom: number; left: number };
  minWidth?: number;
  edgePadding?: number;
}) => {
  const edgeRight = outerRadius + margin.right;
  const edgeLeft = -(outerRadius + margin.left);

  if (horizontalAnchor === 'start') {
    return Math.max(minWidth, edgeRight - labelX - edgePadding);
  }

  return Math.max(minWidth, labelX - edgeLeft - edgePadding);
};
