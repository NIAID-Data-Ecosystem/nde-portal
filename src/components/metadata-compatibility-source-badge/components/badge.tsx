import { Box, Icon, Stack, Text } from '@chakra-ui/react';
import { Group } from '@visx/group';
import { HeatmapRect } from '@visx/heatmap';
import { PatternLines } from '@visx/pattern';
import { scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import React, { useCallback, useMemo } from 'react';
import { FaCircleCheck, FaRegCircleUp } from 'react-icons/fa6';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { Tooltip } from 'src/components/tooltip';
import { MetadataSource } from 'src/hooks/api/types';
import { system } from 'src/theme';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

interface Bin {
  bin: number;
  count: number;
  field: string;
  label: string;
  type: string;
  augmented: number | null;
}

interface Bins {
  bin: number;
  bins: Bin[];
}
const primary2 = system.tokens.getByName('colors.pink.500')?.value;
const secondary2 = system.tokens.getByName('colors.secondary.500')?.value;

function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.max(...data.map(value));
}

// accessors
const bins = (d: Bins) => d.bins;
const count = (d: Bin) => d.count;

const colorMax = (binData: Bins[]) => max(binData, d => max(bins(d), count));
// const bucketSizeMax = (binData: Bins[]) => max(binData, d => bins(d).length);

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
    range: [0.6, 1],
    domain: [0, colorMax(data)],
  });

export type HeatmapProps = {
  width: number;
  height: number;
  data: MetadataSource['sourceInfo']['metadata_completeness'];
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const defaultMargin = { top: 10, left: 0, right: 0, bottom: 0 };

const getBinsData = (fields: Omit<Bin, 'bin'>[], numRows = 2) => {
  return fields.reduce(
    (bins, { augmented, count, field, label, type }, idx) => {
      const col = idx % numRows;
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
const separation = 14;
export const CompatibilityBadge = ({
  width,
  height,
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
    // use TooltipWithBounds
    detectBounds: false,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });
  // data
  const required = Object.entries(data.required_fields || {})
    .map(([field, count]) => {
      const augmented =
        data.required_augmented_fields_coverage?.[field] || null;
      return {
        label: schema[field].name,
        field,
        count,
        augmented,
        type: 'required',
      };
    })
    .sort((a, b) => b.label.localeCompare(a.label));

  const recommended = Object.entries(data.recommended_fields || {})
    .map(([field, count]) => {
      const augmented =
        data.recommended_augmented_fields_coverage?.[field] || null;
      return {
        label: schema[field].name,
        field,
        count,
        augmented,
        type: 'recommended',
      };
    })
    .sort((a, b) => b.label.localeCompare(a.label));

  const NUM_BARS = Math.max(recommended.length, required.length);

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
      _: React.MouseEvent | React.TouchEvent,
      { x, y, data }: { x: number; y: number; data: Bin },
    ) => {
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      const theme = data.type === 'required' ? 'pink' : 'secondary';
      showTooltip({
        tooltipLeft: x,
        tooltipTop: data.type === 'required' ? y - separation : y,
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
      width={`${width}px`}
      height={`${height}px`}
      position='relative'
      css={{
        '& .visx-heatmap-rect:hover': {
          strokeWidth: 2,
          stroke: system.tokens.getByName('colors.warning.default')?.value,
        },
      }}
      onMouseLeave={handleMouseLeave}
    >
      <svg ref={containerRef} width={width} height={height}>
        <PatternLines
          id='fundamental-lines'
          height={5}
          width={5}
          stroke={system.tokens.getByName('colors.pink.400')?.value}
          strokeWidth={1}
          orientation={['diagonal']}
        />
        <PatternLines
          id='secondary-lines'
          height={5}
          width={5}
          stroke={system.tokens.getByName('colors.secondary.500')?.value}
          strokeWidth={1}
          orientation={['diagonal']}
        />
        <Group className='recommended-fields' top={yMax} left={margin.left}>
          <Tooltip content='Recommended fields coverage.'>
            <text
              x={0}
              y={yScale(0)}
              dy={-0.75}
              style={{
                fontSize: '12px',
              }}
              fill={system.tokens.getByName('colors.gray.800')?.value}
            >
              Recommended{' | '}{' '}
              {Math.round(data.percent_recommended_fields * 100)}%
            </text>
          </Tooltip>

          <HeatmapRect
            data={RECOMMENDED_DATA}
            xScale={d => xScale(d) ?? 0}
            yScale={d => yScale(d) ?? 0}
            opacityScale={opacityScale(RECOMMENDED_DATA)}
            colorScale={rectColorScale(RECOMMENDED_DATA, 'recommended')}
            binWidth={binWidth}
            binHeight={binWidth}
            gap={3}
          >
            {heatmap =>
              heatmap.map(heatmapBins => {
                return heatmapBins.map(bin => {
                  const data = bin.bin as Bin;
                  const pattern = 'url(#secondary-lines)';
                  const fieldIsCompatible = data.count > 0;

                  return (
                    <g
                      className='visx-heatmap-rect'
                      key={`heatmap-rect-${bin.row}-${bin.column}`}
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
                        width={bin.width}
                        height={bin.height}
                        x={bin.x}
                        y={bin.y}
                        rx={radius}
                        ry={radius}
                        fill={fieldIsCompatible ? bin.color : pattern}
                        fillOpacity={1}
                      />
                      {data.augmented && (
                        <FaRegCircleUp
                          color={fieldIsCompatible ? 'white' : bin.color}
                          x={bin.x + 1.5}
                          y={bin.y + 1.5}
                          size={10}
                        />
                      )}
                    </g>
                  );
                });
              })
            }
          </HeatmapRect>
        </Group>
        <Group
          className='required-fields'
          top={yMax - binHeight - margin.top - separation}
          left={margin.left}
        >
          <Tooltip content='Fundamental fields coverage.'>
            <text
              x={0}
              y={yScale(0)}
              dy={-0.75}
              style={{
                fontSize: '12px',
              }}
              fill={system.tokens.getByName('colors.gray.800')?.value}
            >
              Fundamental{' | '}
              {Math.round(data.percent_required_fields * 100)}%
            </text>
          </Tooltip>

          <HeatmapRect
            data={REQUIRED_DATA}
            xScale={d => xScale(d) ?? 0}
            yScale={d => yScale(d) ?? 0}
            opacityScale={opacityScale(REQUIRED_DATA)}
            colorScale={rectColorScale(REQUIRED_DATA)}
            binWidth={binWidth}
            binHeight={binWidth}
            gap={3}
          >
            {heatmap =>
              heatmap.map(heatmapBins => {
                return heatmapBins.map(bin => {
                  const data = bin.bin as Bin;
                  const pattern = 'url(#fundamental-lines)';
                  const fieldIsCompatible = data.count > 0;
                  return (
                    <g
                      key={`heatmap-rect-${bin.row}-${bin.column}`}
                      className='visx-heatmap-rect'
                      onMouseMove={(e: React.MouseEvent | React.TouchEvent) =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height,
                          data,
                        })
                      }
                      onTouchMove={(e: React.MouseEvent | React.TouchEvent) =>
                        handleMouseMove(e, {
                          x: bin.x,
                          y: bin.y + bin.height,
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
                        fill={fieldIsCompatible ? bin.color : pattern}
                        fillOpacity={1}

                        // stroke={bin.color}
                        // strokeWidth={0.5}
                      />

                      {data.augmented && (
                        <FaRegCircleUp
                          color={fieldIsCompatible ? 'white' : bin.color}
                          x={bin.x + 1.5}
                          y={bin.y + 1.5}
                          size={10}
                        />
                      )}
                    </g>
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
              borderRadius: '3px',
              fontSize: '14px',
              boxShadow: '0 1px 2px rgba(33,33,33,0.2)',
              lineHeight: '1em',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <Box minW='100px' maxW='220px' lineHeight='shorter'>
              <Text
                fontWeight='medium'
                bg={`${tooltipData.theme}.500`}
                color='white'
                px={2}
                py={1.5}
                lineHeight='inherit'
              >
                {tooltipData.type.charAt(0).toUpperCase() +
                  tooltipData.type.slice(1)}
              </Text>
              <Stack p={2} gap={1} fontSize='xs' lineHeight='shorter'>
                {tooltipData.count ? (
                  /* Collected metadata */
                  <>
                    <Text lineHeight='inherit'>
                      <Icon
                        as={FaCircleCheck}
                        color='green.500'
                        boxSize={3}
                        mr={0.5}
                        mb={1}
                      />
                      <strong>{tooltipData.label} </strong>
                      metadata is collected and available for this source.
                    </Text>
                    {/* Collected metadata and augmented */}
                    {tooltipData.augmented ? (
                      <Text mt={1} lineHeight='inherit'>
                        <Icon
                          as={FaRegCircleUp}
                          color='green.500'
                          boxSize={3}
                          mr={0.5}
                          mb={1}
                        />
                        <strong>{tooltipData.label} </strong>
                        was also augmented for this source.
                      </Text>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <Text lineHeight='inherit'>
                    {tooltipData.augmented ? (
                      /* No metadata but augmented */
                      <Text as='span' mt={1} lineHeight='inherit'>
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
                      <Text as='span' mt={1} lineHeight='inherit'>
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
