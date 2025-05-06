import React, { useCallback, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { HeatmapRect } from '@visx/heatmap';
import { MetadataSource } from 'src/hooks/api/types';
import { theme } from 'src/theme';
import { PatternLines } from '@visx/pattern';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { FaCircleCheck, FaRegCircleUp } from 'react-icons/fa6';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

interface Bin {
  augmented: number | null;
  bin: number;
  count: number;
  field: string;
  label: string;
  type: string;
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
    ? [primary2, primary2]
    : type === 'required'
    ? [primary2, primary2]
    : [secondary2, secondary2];

  return scaleLinear<string>({
    range: colorScheme,
    domain: [0, colorMax(data)],
  });
};
const opacityScale = (data: Bins[]) =>
  scaleLinear<number>({
    range: [1, 1],
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
  return fields.reduce(
    (bins, { augmented, count, field, label, type }, idx) => {
      const col = idx % NUM_ROWS;
      const column = bins.find(c => c.bin === col);
      if (column) {
        column.bins.push({ bin: col, augmented, count, field, label, type });
      } else {
        bins.push({
          bin: col,
          bins: [{ bin: col, augmented, count, field, label, type }],
        });
      }

      return bins;
    },
    [] as Bins[],
  );
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
    return {
      augmented,
      count,
      field,
      label: schema[field].name,
      type: 'required',
    };
  });

  const recommended_fields = Object.entries(
    data?.sourceInfo?.metadata_completeness?.recommended_fields || {},
  ).map(([field, count]) => {
    const augmented =
      data?.sourceInfo?.metadata_completeness
        ?.recommended_augmented_fields_coverage?.[field] || null;
    return {
      augmented,
      count,
      field,
      label: schema[field].name,
      type: 'recommended',
    };
  });

  // Fields sorted alphabetically
  const fields = [...required, ...recommended_fields].sort((a, b) =>
    b.label.localeCompare(a.label),
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
                  const fieldIsCompatible = bin?.count && bin.count > 0;

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
                          fill={fieldIsCompatible ? 'white' : bin.color}
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
            left={tooltipLeft - 10}
            top={tooltipTop}
            style={{
              position: 'absolute',
              backgroundColor: 'white',
              color: '#666666',
              // padding: '.3rem .5rem',
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
                  /* Collected metadata */
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
                    {/* Collected metadata and augmented */}
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
                      /* No metadata but augmented */
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
                      /* No metadata and not augmented */
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

export default HeatMap;
