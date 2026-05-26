import React, { useCallback, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { MetadataSource } from 'src/hooks/api/types';
import { theme } from 'src/theme';
import { PatternLines } from '@visx/pattern';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import Tooltip from 'src/components/tooltip';
import { FaCircleCheck, FaRegCircleUp } from 'react-icons/fa6';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

interface Bin {
  count: number;
  field: string;
  label: string;
  type: string;
  augmented: number | null;
}

const primary2 = theme.colors.pink[500];
const secondary2 = theme.colors.secondary[500];

const colorMax = (bins: Bin[]) =>
  bins.reduce((m, b) => Math.max(m, b.count), 0);

const rectColorScale = (bins: Bin[], type?: string) => {
  const colorScheme = !type
    ? [primary2, primary2]
    : type === 'required'
    ? [primary2, primary2]
    : [secondary2, secondary2];

  return scaleLinear<string>({
    range: colorScheme,
    domain: [0, colorMax(bins)],
  });
};

export type HeatmapProps = {
  width: number;
  height?: number;
  data: MetadataSource['sourceInfo']['metadata_completeness'];
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const defaultMargin = { top: 10, left: 0, right: 0, bottom: 0 };

// Fixed bin sizing — bins wrap to the next row when they exceed the parent width.
const BIN_SIZE = 14;
const BIN_GAP = 2;
const LABEL_HEIGHT = 18;
const CATEGORY_GAP = 14;
const RADIUS = 2;

let tooltipTimeout: number;

interface ToolTipData extends Bin {
  percent: string;
  theme: string;
}

export const CompatibilityBadge = ({
  width,
  data,
  margin = defaultMargin,
}: HeatmapProps) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<ToolTipData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: false,
    scroll: true,
  });

  // Sort alphabetically so bins read left-to-right, top-to-bottom.
  const required: Bin[] = Object.entries(data.required_fields || {})
    .map(([field, count]) => ({
      label: schema[field]?.name || '',
      field,
      count,
      augmented: data.required_augmented_fields_coverage?.[field] || null,
      type: 'required',
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const recommended: Bin[] = Object.entries(data.recommended_fields || {})
    .map(([field, count]) => ({
      label: schema[field]?.name || '',
      field,
      count,
      augmented: data.recommended_augmented_fields_coverage?.[field] || null,
      type: 'recommended',
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const binsPerRow = Math.max(
    1,
    Math.floor((innerWidth + BIN_GAP) / (BIN_SIZE + BIN_GAP)),
  );

  const requiredRows = Math.max(1, Math.ceil(required.length / binsPerRow));
  const recommendedRows = Math.max(
    1,
    Math.ceil(recommended.length / binsPerRow),
  );

  const requiredHeight =
    LABEL_HEIGHT + requiredRows * BIN_SIZE + (requiredRows - 1) * BIN_GAP;
  const recommendedHeight =
    LABEL_HEIGHT + recommendedRows * BIN_SIZE + (recommendedRows - 1) * BIN_GAP;

  const requiredTop = margin.top;
  const recommendedTop = requiredTop + requiredHeight + CATEGORY_GAP;
  const totalHeight = recommendedTop + recommendedHeight + margin.bottom;

  const requiredColor = useMemo(
    () => rectColorScale(required, 'required'),
    [required],
  );
  const recommendedColor = useMemo(
    () => rectColorScale(recommended, 'recommended'),
    [recommended],
  );

  const handleMouseMove = useCallback(
    (
      _: React.MouseEvent | React.TouchEvent,
      { x, y, data }: { x: number; y: number; data: Bin },
    ) => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      const theme = data.type === 'required' ? 'pink' : 'secondary';
      showTooltip({
        tooltipLeft: x,
        tooltipTop: y,
        tooltipData: {
          ...data,
          percent: `${Math.round(data.count * 100)}%`,
          type: data.type === 'required' ? 'Fundamental' : 'Recommended',
          theme,
        },
      });
    },
    [showTooltip],
  );

  const handleMouseLeave = useCallback(() => {
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
    }, 300);
  }, [hideTooltip]);

  const renderBins = (
    bins: Bin[],
    color: (n: number) => string,
    patternId: string,
    groupTop: number,
  ) =>
    bins.map((bin, idx) => {
      const col = idx % binsPerRow;
      const row = Math.floor(idx / binsPerRow);
      const x = col * (BIN_SIZE + BIN_GAP);
      const y = LABEL_HEIGHT + row * (BIN_SIZE + BIN_GAP);
      const fieldIsCompatible = bin.count > 0;
      const fill = fieldIsCompatible ? color(bin.count) : `url(#${patternId})`;

      return (
        <Box
          as='g'
          className='visx-heatmap-rect'
          key={`heatmap-rect-${bin.type}-${idx}`}
          onMouseMove={(e: React.MouseEvent | React.TouchEvent) =>
            handleMouseMove(e, {
              x: margin.left + x + BIN_SIZE / 2,
              y: groupTop + y + BIN_SIZE,
              data: bin,
            })
          }
          onTouchMove={(e: React.MouseEvent | React.TouchEvent) =>
            handleMouseMove(e, {
              x: margin.left + x + BIN_SIZE / 2,
              y: groupTop + y + BIN_SIZE,
              data: bin,
            })
          }
          onMouseLeave={handleMouseLeave}
          rx={RADIUS}
          ry={RADIUS}
        >
          <rect
            width={BIN_SIZE}
            height={BIN_SIZE}
            x={x}
            y={y}
            rx={RADIUS}
            ry={RADIUS}
            fill={fill}
            fillOpacity={1}
          />
          {bin.augmented && (
            <Icon
              as={FaRegCircleUp}
              color={fieldIsCompatible ? 'white' : color(0)}
              x={x + BIN_SIZE / 2}
              y={y + BIN_SIZE / 2}
              style={{ transform: 'translate(-5px, -5px)' }}
              size={10}
            />
          )}
        </Box>
      );
    });

  return width < 10 ? null : (
    <Box
      width={`${width}px`}
      height={`${totalHeight}px`}
      position='relative'
      sx={{
        '.visx-heatmap-rect:hover': {
          strokeWidth: 2,
          stroke: theme.colors.status.warning,
        },
      }}
      onMouseLeave={handleMouseLeave}
    >
      <svg ref={containerRef} width={width} height={totalHeight}>
        <PatternLines
          id='fundamental-lines'
          height={5}
          width={5}
          stroke={theme.colors.pink[400]}
          strokeWidth={1}
          orientation={['diagonal']}
        />
        <PatternLines
          id='secondary-lines'
          height={5}
          width={5}
          stroke={theme.colors.secondary[500]}
          strokeWidth={1}
          orientation={['diagonal']}
        />

        <Group
          className='recommended-fields'
          top={recommendedTop}
          left={margin.left}
        >
          <Tooltip
            label='Recommended fields coverage.'
            position='absolute'
            left={0}
            top={0}
          >
            <Box
              as='text'
              x={0}
              y={LABEL_HEIGHT - 4}
              fontSize='12px'
              fill='gray.800'
            >
              Recommended{' | '}
              {Math.round(data.percent_recommended_fields * 100)}%
            </Box>
          </Tooltip>
          {renderBins(
            recommended,
            recommendedColor,
            'secondary-lines',
            recommendedTop,
          )}
        </Group>

        <Group className='required-fields' top={requiredTop} left={margin.left}>
          <Tooltip
            label='Fundamental fields coverage.'
            position='absolute'
            left={0}
            top={0}
          >
            <Box
              as='text'
              x={0}
              y={LABEL_HEIGHT - 4}
              fontSize='12px'
              fill='gray.800'
            >
              Fundamental{' | '}
              {Math.round(data.percent_required_fields * 100)}%
            </Box>
          </Tooltip>
          {renderBins(
            required,
            requiredColor,
            'fundamental-lines',
            requiredTop,
          )}
        </Group>
      </svg>
      {tooltipOpen &&
        tooltipData &&
        tooltipLeft != null &&
        tooltipTop != null && (
          <TooltipInPortal
            key={Math.random()}
            left={tooltipLeft - 10}
            top={tooltipTop}
            style={{
              position: 'absolute',
              backgroundColor: 'white',
              color: '#666666',
              borderRadius: '3px',
              fontSize: '14px',
              boxShadow: '0 1px 2px rgba(33,33,33,0.2)',
              lineHeight: '1em',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <Box minW='100px' maxW='220px'>
              <Text
                fontWeight='medium'
                bg={`${tooltipData.theme}.500`}
                color='white'
                px={2}
                py={1.5}
              >
                {tooltipData.type.charAt(0).toUpperCase() +
                  tooltipData.type.slice(1)}
              </Text>
              <Stack p={2} spacing={1} fontSize='xs'>
                {tooltipData.count ? (
                  <>
                    <Text lineHeight='shorter'>
                      <Icon
                        as={FaCircleCheck}
                        color='green.500'
                        boxSize={3}
                        mr={0.5}
                      />
                      <strong>{tooltipData.label} </strong>
                      metadata is collected and available for this source.
                    </Text>
                    {tooltipData.augmented ? (
                      <Text mt={1} lineHeight='shorter'>
                        <Icon
                          as={FaRegCircleUp}
                          color='green.500'
                          boxSize={3}
                          mr={0.5}
                        />
                        <strong>{tooltipData.label} </strong>
                        was also augmented for this source.
                      </Text>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <Text lineHeight='short'>
                    {tooltipData.augmented ? (
                      <Text as='span' mt={1}>
                        <Icon
                          as={FaRegCircleUp}
                          color='green.500'
                          boxSize={3}
                          mr={0.5}
                        />
                        <strong>{tooltipData.label} </strong> metadata was not
                        found for this source, but was augmented for this
                        source.
                      </Text>
                    ) : (
                      <Text as='span' mt={1}>
                        <strong>{tooltipData.label} </strong> metadata was not
                        found for this source.
                      </Text>
                    )}
                  </Text>
                )}
              </Stack>
            </Box>
          </TooltipInPortal>
        )}
    </Box>
  );
};
