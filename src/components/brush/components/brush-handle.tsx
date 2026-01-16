import React from 'react';
import { Group } from '@visx/group';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';

interface BrushHandleProps extends BrushHandleRenderProps {
  isFocused: boolean;
  label?: string;
  strokeColor?: string;
  fillColor?: string;
  labelColor?: string;
  handleDimensions?: {
    width: number;
    height: number;
  };
  labelOptions?: {
    padding?: number;
    fontSize?: number;
    fontWeight?: number | string;
    verticalAdjustment?: number;
  };
}

export const BrushHandle = ({
  x,
  height,
  isBrushActive,
  className,
  isFocused,
  label,
  strokeColor = '#999',
  fillColor = '#f2f2f2',
  labelColor,
  handleDimensions = { width: 8, height: 15 },
  labelOptions = {},
}: BrushHandleProps) => {
  const {
    padding: labelPadding = 6,
    fontSize: labelFontSize = 13,
    fontWeight: labelFontWeight = 600,
    verticalAdjustment = 0,
  } = labelOptions;

  const { width: pathWidth, height: pathHeight } = handleDimensions;

  // Don't render if brush is not active
  if (!isBrushActive) {
    return null;
  }

  // Determine if this is a left or right handle
  const isLeftHandle = className?.includes('left');

  // Calculate handle position
  // When label is present, use quarter offset; otherwise use half offset (original behavior)
  const leftPosition = label ? x + pathWidth / 4 : x + pathWidth / 2;

  // Calculate label position if label is provided
  const labelX = isLeftHandle
    ? -(pathWidth / 2) - labelPadding
    : pathWidth / 2 + labelPadding;

  const labelAnchor = isLeftHandle ? 'end' : 'start';

  // Use focused stroke color or default
  const finalStrokeColor = isFocused ? labelColor || strokeColor : strokeColor;

  const finalLabelColor = labelColor || finalStrokeColor;

  return (
    <Group
      left={leftPosition}
      top={(height - pathHeight) / 2}
      role='slider'
      aria-label={`${isLeftHandle ? 'Left' : 'Right'} brush handle`}
    >
      {/* Handle rectangle with grip lines */}
      <path
        fill={fillColor}
        d={`M -4.5 0.5 L 3.5 0.5 L 3.5 ${pathHeight + 0.5} L -4.5 ${
          pathHeight + 0.5
        } L -4.5 0.5 M -1.5 4 L -1.5 ${pathHeight - 3} M 0.5 4 L 0.5 ${
          pathHeight - 3
        }`}
        strokeWidth={isFocused ? '1.5' : '1'}
        stroke={finalStrokeColor}
        style={{ cursor: 'ew-resize' }}
      />

      {/* Optional year label positioned next to the handle */}
      {label && (
        <text
          x={labelX}
          y={pathHeight / 2 + verticalAdjustment}
          textAnchor={labelAnchor}
          dominantBaseline='middle'
          fill={finalLabelColor}
          fontSize={labelFontSize}
          fontWeight={labelFontWeight}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </Group>
  );
};

export default BrushHandle;
