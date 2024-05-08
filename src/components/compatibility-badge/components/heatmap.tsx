import React, { useCallback, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { MetadataSource } from 'src/hooks/api/types';
import { theme } from 'src/theme';
import { PatternLines } from '@visx/pattern';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Box, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

interface Bin {
  bin: number;
  count: number;
  field: string;
  type: string;
  augmented: number | null;
}

interface Bins {
  bin: number;
  bins: Bin[];
}
const primary1 = theme.colors.pink[100];
const primary2 = theme.colors.pink[500];
const secondary1 = theme.colors.secondary[100];
const secondary2 = theme.colors.secondary[500];
const bg = '#fff';

function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.max(...data.map(value));
}

function min<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.min(...data.map(value));
}

// accessors
const bins = (d: Bins) => d.bins;
const count = (d: Bin) => d.count;

const colorMax = (binData: Bins[]) => max(binData, d => max(bins(d), count));
const bucketSizeMax = (binData: Bins[]) => max(binData, d => bins(d).length);

const rectColorScale = (data: Bins[], type?: string) => {
  const colorScheme = !type
    ? [primary1, primary2]
    : type === 'required'
    ? [primary1, primary2]
    : [secondary1, secondary2];

  return scaleLinear<string>({
    range: colorScheme,
    domain: [0, colorMax(data)],
  });
};
const opacityScale = (data: Bins[]) =>
  scaleLinear<number>({
    range: [0.6, 1],
    domain: [0, colorMax(data)],
  });

export type HeatmapProps = {
  width: number;
  height: number;
  data: MetadataSource;
  margin?: { top: number; right: number; bottom: number; left: number };

  // Used for determining the best colorscheme for the heatmap in our deliberation process. If true, the heatmap will use a single color scheme. If false, the heatmap will use two color schemes.
  isMonoChromatic: boolean;
};

const defaultMargin = { top: 10, left: 10, right: 10, bottom: 10 };
const NUM_ROWS = 6;

const getBinsData = (fields: Omit<Bin, 'bin'>[]) => {
  return fields.reduce((bins, { field, count, type, augmented }, idx) => {
    const col = idx % NUM_ROWS;
    const column = bins.find(c => c.bin === col);
    if (column) {
      column.bins.push({ bin: col, count, field, augmented, type });
    } else {
      bins.push({
        bin: col,
        bins: [{ bin: col, count, field, augmented, type }],
      });
    }

    return bins;
  }, [] as Bins[]);
};
let tooltipTimeout: number;

interface ToolTipData extends Bin {
  percent: string;
  theme: string;
}
const HeatMap = ({
  width,
  height,
  data,
  margin = defaultMargin,
  isMonoChromatic,
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
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });

  // data
  const required = Object.entries(
    data?.sourceInfo?.metadata_completeness?.required_fields || {},
  ).map(([field, count]) => {
    const augmented =
      data?.sourceInfo?.metadata_completeness
        ?.required_augmented_fields_coverage?.[field] || null;
    return { field, count, augmented, type: 'required' };
  });

  const recommended_fields = Object.entries(
    data?.sourceInfo?.metadata_completeness?.recommended_fields || {},
  ).map(([field, count]) => {
    const augmented =
      data?.sourceInfo?.metadata_completeness
        ?.recommended_augmented_fields_coverage?.[field] || null;
    return { field, count, augmented, type: 'recommended' };
  });

  // Fields sorted alphabetically
  const fields = [...required, ...recommended_fields].sort((a, b) =>
    b.field.localeCompare(a.field),
  );
  const BIN_DATA = getBinsData(fields).reverse();

  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right
      : width;
  const xMax = size;
  const yMax = height - margin.bottom - margin.top;
  const binWidth = xMax / BIN_DATA.length;
  const binHeight = yMax / bucketSizeMax(BIN_DATA);
  const radius = min([binWidth, binHeight], d => d) / 8;

  // scales
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, BIN_DATA.length],
        range: [0, xMax],
      }),
    [BIN_DATA, xMax],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, bucketSizeMax(BIN_DATA)],
        range: [yMax, 0],
      }),
    [BIN_DATA, yMax],
  );

  // event handlers
  const handleMouseMove = useCallback(
    (
      event: React.MouseEvent | React.TouchEvent,
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
          theme: isMonoChromatic ? 'pink' : theme,
        },
      });
    },
    [showTooltip, isMonoChromatic],
  );

  const handleMouseLeave = useCallback(() => {
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
    }, 300);
  }, [hideTooltip]);

  return width < 10 ? null : (
    <Box
      width={width}
      height={height}
      position='relative'
      sx={{
        '.visx-heatmap-rect:hover': {
          strokeWidth: 2,
          stroke: theme.colors.status.warning,
        },
      }}
      onMouseLeave={handleMouseLeave}
    >
      <svg ref={containerRef} width={width} height={height}>
        <PatternLines
          id='fundamental-lines'
          height={5}
          width={5}
          stroke={theme.colors.pink[400]}
          strokeWidth={1}
          orientation={['diagonal']}
        />
        <PatternLines
          id='recommended-lines'
          height={5}
          width={5}
          stroke={theme.colors.secondary[300]}
          strokeWidth={1}
          orientation={['diagonal']}
        />
        <rect x={0} y={0} width={width} height={height} rx={14} fill={bg} />
        <Group top={margin.top - binHeight} left={margin.left}>
          <HeatmapRect
            data={BIN_DATA}
            xScale={d => xScale(d) ?? 0}
            yScale={d => yScale(d) ?? 0}
            opacityScale={opacityScale(BIN_DATA)}
            colorScale={isMonoChromatic ? rectColorScale(BIN_DATA) : undefined}
            binWidth={binWidth}
            binHeight={binHeight}
            gap={3}
          >
            {heatmap =>
              heatmap.map(heatmapBins => {
                return heatmapBins.map(bin => {
                  const data = bin.bin as Bin;
                  const color = isMonoChromatic
                    ? bin.color
                    : rectColorScale(BIN_DATA, data.type)(data.count);

                  const pattern = isMonoChromatic
                    ? 'url(#fundamental-lines)'
                    : data.type === 'required'
                    ? 'url(#fundamental-lines)'
                    : 'url(#recommended-lines)';
                  return (
                    <Box
                      key={`heatmap-rect-${bin.row}-${bin.column}`}
                      as='g'
                      className='visx-heatmap-rect'
                      onMouseMove={(e: React.MouseEvent | React.TouchEvent) =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height * 2,
                          data,
                        })
                      }
                      onTouchMove={(e: React.MouseEvent | React.TouchEvent) =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height * 2,
                          data,
                        })
                      }
                      onMouseLeave={handleMouseLeave}
                      rx={radius}
                      ry={radius}
                    >
                      <rect
                        className='visx-heatmap-rect'
                        width={bin.width}
                        height={bin.height}
                        x={bin.x}
                        y={bin.y}
                        rx={radius}
                        ry={radius}
                        strokeWidth={2}
                        fill={bin.count ? color : pattern}
                        fillOpacity={bin.count ? bin.opacity : '1'}
                      />
                      {data.augmented && (
                        <Box
                          as='circle'
                          r={2}
                          cx={bin.x + bin.width / 2}
                          cy={bin.y + bin.height / 2}
                          fill='whiteAlpha.900'
                          stroke='white'
                          strokeWidth={2}
                        />
                      )}
                    </Box>
                  );
                });
              })
            }
          </HeatmapRect>
        </Group>
      </svg>
      {tooltipOpen &&
        tooltipData &&
        tooltipLeft != null &&
        tooltipTop != null && (
          <TooltipInPortal
            key={Math.random()}
            left={tooltipLeft + 10}
            top={tooltipTop + 10}
          >
            <Box borderRadius='semi' minW='100px' maxW='200px'>
              <Text
                fontWeight='medium'
                bg={`${tooltipData.theme}.500`}
                color='white'
                px={1}
                py={1}
              >
                {tooltipData.type.charAt(0).toUpperCase() +
                  tooltipData.type.slice(1)}
              </Text>
              <Stack mt={2} spacing={1} fontSize='xs'>
                <Text lineHeight='shorter'>
                  Coverage of <strong>{schema[tooltipData.field].name}</strong>{' '}
                  is{' '}
                  <Text as='span' bg={`${tooltipData.theme}.100`}>
                    {tooltipData.percent}
                  </Text>
                  .
                </Text>

                {tooltipData.augmented && (
                  <Text lineHeight='shorter'>
                    Augmented coverage of{' '}
                    <strong>{schema[tooltipData.field].name}</strong> is{' '}
                    <Text as='span' bg={`${tooltipData.theme}.100`}>
                      {Math.round(tooltipData.augmented * 100)}%
                    </Text>
                    .
                  </Text>
                )}
              </Stack>
            </Box>
          </TooltipInPortal>
        )}
    </Box>
  );
};

export default HeatMap;
