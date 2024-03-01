import React, { useCallback, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { MetadataSource } from 'src/utils/api/types';
import { theme } from 'src/theme';
import { PatternLines } from '@visx/pattern';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Box, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import Tooltip from 'src/components/tooltip';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

interface Bin {
  bin: number;
  count: number;
  field: string;
  type: string;
}

interface Bins {
  bin: number;
  bins: Bin[];
}
const primary1 = theme.colors.pink[100];
const primary2 = theme.colors.pink[600];
const secondary1 = theme.colors.secondary[100];
const secondary2 = theme.colors.secondary[600];
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
// const bucketSizeMax = (binData: Bins[]) => max(binData, d => bins(d).length);

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

const getBinsData = (fields: Omit<Bin, 'bin'>[], numRows = 2) => {
  return fields.reduce((bins, { field, count, type }, idx) => {
    const col = idx % numRows;
    const column = bins.find(c => c.bin === col);
    if (column) {
      column.bins.push({ bin: col, count, field, type });
    } else {
      bins.push({ bin: col, bins: [{ bin: col, count, field, type }] });
    }

    return bins;
  }, [] as Bins[]);
};

let tooltipTimeout: number;

interface ToolTipData extends Bin {
  percent: string;
  theme: string;
}
const separation = 16;
const BarChartHeatMap = ({
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
  )
    .map(([field, count]) => ({ field, count, type: 'required' }))
    .sort((a, b) => {
      return a.count - b.count;
    });

  const recommended = Object.entries(
    data?.sourceInfo?.metadata_completeness?.recommended_fields || {},
  )
    .map(([field, count]) => ({ field, count, type: 'recommended' }))
    .sort((a, b) => a.count - b.count);

  const NUM_BARS = 21;
  const ALL_DATA = getBinsData([...required, ...recommended], NUM_BARS);

  const REQUIRED_DATA = getBinsData(required, NUM_BARS).reverse();

  const RECOMMENDED_DATA = getBinsData(recommended, NUM_BARS).reverse();

  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right
      : width;

  const xMax = size;
  const yMax = height / 2 - margin.bottom - margin.top;

  const binWidth = xMax / NUM_BARS;

  const bucketSizeMax = 2;
  const binHeight = yMax / bucketSizeMax;

  const radius = 2;

  // scales
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, NUM_BARS],
        range: [0, xMax],
      }),
    [NUM_BARS, xMax],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, bucketSizeMax],
        range: [yMax, 0],
      }),
    [bucketSizeMax, yMax],
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
          id='secondary-lines'
          height={5}
          width={5}
          stroke={theme.colors.secondary[300]}
          strokeWidth={1}
          orientation={['diagonal']}
        />
        <rect x={0} y={0} width={width} height={height} rx={14} fill={bg} />
        <Group left={margin.left} top={yMax - margin.top}>
          <Tooltip
            label='Recommended fields coverage.'
            position='absolute'
            left={0}
            top={0}
          >
            <Box
              as='text'
              x={0}
              y={yScale(0)}
              dy={-0.75}
              fontSize='11px'
              style={{ fill: 'gray' }}
            >
              Recommended{' | '}{' '}
              {Math.round(
                (data.sourceInfo.metadata_completeness
                  .sum_recommended_coverage /
                  recommended.length) *
                  100,
              )}
              %
            </Box>
          </Tooltip>

          <HeatmapRect
            data={RECOMMENDED_DATA}
            xScale={d => xScale(d) ?? 0}
            yScale={d => yScale(d) ?? 0}
            opacityScale={opacityScale(RECOMMENDED_DATA)}
            colorScale={
              isMonoChromatic
                ? rectColorScale(RECOMMENDED_DATA, 'recommended')
                : undefined
            }
            binWidth={binWidth}
            binHeight={binWidth}
            gap={2}
          >
            {heatmap =>
              heatmap.map(heatmapBins => {
                return heatmapBins.map(bin => {
                  const data = bin.bin as Bin;
                  const pattern = 'url(#secondary-lines)';
                  return (
                    <rect
                      key={`heatmap-rect-${bin.row}-${bin.column}`}
                      className='visx-heatmap-rect'
                      width={bin.width}
                      height={bin.height}
                      x={bin.x}
                      y={bin.y}
                      rx={radius}
                      ry={radius}
                      strokeWidth={2}
                      fill={bin.count ? bin.color : pattern}
                      fillOpacity={bin.count ? bin.opacity : '1'}
                      onMouseMove={e =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height * 2,
                          data,
                        })
                      }
                      onTouchMove={e =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height * 2,
                          data,
                        })
                      }
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                });
              })
            }
          </HeatmapRect>
        </Group>
        <Group
          top={yMax - margin.top - binHeight - separation}
          left={margin.left}
        >
          <Tooltip
            label='Fundemental fields coverage.'
            position='absolute'
            left={0}
            top={0}
          >
            <Box
              as='text'
              x={0}
              y={yScale(0)}
              dy={-0.75}
              fontSize='11px'
              style={{ fill: 'gray' }}
            >
              Fundamental{' | '}
              {Math.round(
                (data.sourceInfo.metadata_completeness.sum_required_coverage /
                  required.length) *
                  100,
              )}
              %
            </Box>
          </Tooltip>

          <HeatmapRect
            data={REQUIRED_DATA}
            xScale={d => xScale(d) ?? 0}
            yScale={d => yScale(d) ?? 0}
            opacityScale={opacityScale(REQUIRED_DATA)}
            colorScale={
              isMonoChromatic ? rectColorScale(REQUIRED_DATA) : undefined
            }
            binWidth={binWidth}
            binHeight={binWidth}
            gap={2}
          >
            {heatmap =>
              heatmap.map(heatmapBins => {
                return heatmapBins.map(bin => {
                  const data = bin.bin as Bin;
                  const pattern = 'url(#fundamental-lines)';
                  return (
                    <rect
                      key={`heatmap-rect-${bin.row}-${bin.column}`}
                      className='visx-heatmap-rect'
                      width={bin.width}
                      height={bin.height}
                      x={bin.x}
                      y={bin.y}
                      rx={radius}
                      ry={radius}
                      strokeWidth={2}
                      fill={bin.count ? bin.color : pattern}
                      fillOpacity={bin.count ? bin.opacity : '1'}
                      onMouseMove={e =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height,
                          data,
                        })
                      }
                      onTouchMove={e =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height,
                          data,
                        })
                      }
                      onMouseLeave={handleMouseLeave}
                    />
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
            left={tooltipLeft - 10}
            top={tooltipTop}
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
              <Stack mt={2} spacing={2} fontSize='xs'>
                <Text lineHeight='shorter'>
                  Coverage of <strong>{schema[tooltipData.field].name}</strong>{' '}
                  is{' '}
                  <Text as='span' bg={`${tooltipData.theme}.100`}>
                    {tooltipData.percent}
                  </Text>
                  .
                </Text>
              </Stack>
            </Box>
          </TooltipInPortal>
        )}
    </Box>
  );
};

export default BarChartHeatMap;