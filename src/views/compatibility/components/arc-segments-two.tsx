import React, { useCallback, useMemo, useState } from 'react';
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { MetadataSource } from 'src/hooks/api/types';
import { theme } from 'src/theme';
import { PatternLines } from '@visx/pattern';
import { Box, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { Arc } from '@visx/shape';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

export type ArcSegmentsProps = {
  width: number;
  height: number;
  data: MetadataSource;
  margin?: { top: number; right: number; bottom: number; left: number };
};

// A ring for each type;
const FIELD_TYPES = [
  {
    label: 'Recommended',
    type: 'recommended' as FieldDatum['type'],
    colorScheme: 'secondary',
  },
  {
    label: 'Fundamental',
    type: 'required' as FieldDatum['type'],
    colorScheme: 'pink',
  },
];
const NUM_RINGS = FIELD_TYPES.length;
const ARC_PI = 2 * Math.PI * 0.5;
const defaultMargin = { top: 10, left: 10, right: 10, bottom: 10 };

export const ArcSegmentsTwo = ({
  width,
  data,
  margin = defaultMargin,
}: ArcSegmentsProps) => {
  const required = useMemo(
    () =>
      Object.entries(data.sourceInfo.metadata_completeness?.required_fields)
        .map(([field, value]) => {
          const augmented =
            data?.sourceInfo?.metadata_completeness
              ?.required_augmented_fields_coverage?.[field] || null;
          return {
            augmented,
            field,
            value: value < 0.1 ? Math.round(value) : value,
            type: 'required' as FieldDatum['type'],
          };
        })
        .sort((a, b) => {
          // First, sort by whether value is greater than 0 (descending, so items > 0 come first)
          if (a.value > 0 && b.value === 0) return -1;
          if (a.value === 0 && b.value > 0) return 1;

          // If both have values > 0 or both have values = 0, sort by type (descending)
          if (a.type > b.type) return -1;
          if (a.type < b.type) return 1;

          // sort by value in descending order within the same type
          return b.value - a.value;
        }),
    [
      data.sourceInfo.metadata_completeness?.required_augmented_fields_coverage,
      data.sourceInfo.metadata_completeness?.required_fields,
    ],
  );
  const recommended = useMemo(
    () =>
      Object.entries(data.sourceInfo.metadata_completeness?.recommended_fields)
        .map(([field, value]) => {
          const augmented =
            data?.sourceInfo?.metadata_completeness
              ?.recommended_augmented_fields_coverage?.[field] || null;
          return {
            augmented,
            field,
            value: value < 0.1 ? Math.round(value) : value,
            type: 'recommended' as FieldDatum['type'],
          };
        })
        .sort((a, b) => {
          // First, sort by whether value is greater than 0 (descending, so items > 0 come first)
          if (a.value > 0 && b.value === 0) return -1;
          if (a.value === 0 && b.value > 0) return 1;

          // If both have values > 0 or both have values = 0, sort by type (descending)
          if (a.type > b.type) return -1;
          if (a.type < b.type) return 1;

          // sort by value in descending order within the same type
          return b.value - a.value;
        }),
    [
      data.sourceInfo.metadata_completeness
        ?.recommended_augmented_fields_coverage,
      data.sourceInfo.metadata_completeness?.recommended_fields,
    ],
  );

  // The width of each ring is calculated based on the width of the svg and the number of rings
  const SIZE_WIDTH = width - margin.left - margin.right; // add margins here

  const SIZE_INNER = SIZE_WIDTH / 2;
  const RING_WIDTH = useMemo(
    () => (SIZE_WIDTH - SIZE_INNER) / NUM_RINGS,
    [SIZE_INNER, SIZE_WIDTH],
  );

  // event handler
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const handleClick = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  const [hoveredType, setHoveredType] = useState<FieldDatum['type'] | null>(
    null,
  );
  const getCoveragePercentage = useCallback(
    (type: FieldDatum['type'] | null) => {
      if (type === 'recommended') {
        return Math.round(
          (data.sourceInfo.metadata_completeness.sum_recommended_coverage /
            recommended.length) *
            100,
        );
      } else if (type === 'required') {
        return Math.round(
          (data.sourceInfo.metadata_completeness.sum_required_coverage /
            required.length) *
            100,
        );
      } else {
        const sum_recommended =
          data.sourceInfo.metadata_completeness.sum_recommended_coverage;
        const sum_required =
          data.sourceInfo.metadata_completeness.sum_required_coverage;
        return Math.round(
          ((sum_recommended + sum_required) /
            (recommended.length + required.length)) *
            100,
        );
      }
    },
    [
      data.sourceInfo.metadata_completeness.sum_recommended_coverage,
      data.sourceInfo.metadata_completeness.sum_required_coverage,
      recommended.length,
      required.length,
    ],
  );

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<any>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // use TooltipWithBounds
    detectBounds: true,
    // when tooltip containers are scrolled, this will correctly update the Tooltip position
    scroll: true,
  });
  return (
    <Box
      width={width}
      height={width}
      position='relative'
      mb={`${margin.bottom}px`}
      sx={{
        '.arc-segment:hover': {
          strokeWidth: 2,
          stroke: 'black',
        },
      }}
    >
      <svg
        ref={containerRef}
        width={width}
        height={width}
        onClick={handleClick}
        onMouseLeave={e => {
          setHoveredType(null);
          hideTooltip();
        }}
      >
        <PatternLines
          id='required-lines'
          height={5}
          width={5}
          stroke={theme.colors.pink[400]}
          strokeWidth={1}
          orientation={['diagonalRightToLeft']}
        />
        <PatternLines
          id='recommended-lines'
          height={5}
          width={5}
          stroke={theme.colors.secondary[300]}
          strokeWidth={1}
          orientation={['diagonalRightToLeft']}
        />
        <PatternLines
          id='default-lines'
          height={5}
          width={5}
          stroke={theme.colors.gray[300]}
          strokeWidth={1}
          orientation={['diagonalRightToLeft']}
        />
        <g transform={`translate(${width / 2},${width / 2}) rotate(-90)`}>
          {FIELD_TYPES.map((typeDetails, idx) => {
            const { type } = FIELD_TYPES[idx];
            const outerRadius = (SIZE_WIDTH - idx * RING_WIDTH) / 2;
            const RINGS_SPACING =
              (showDetails || hoveredType) && type === 'recommended'
                ? 0.75
                : 0.5;

            return (
              <g key={type}>
                {/* Refactor this nonsense */}
                <Arc
                  id={'total-bg-arc-' + type}
                  startAngle={0}
                  endAngle={ARC_PI}
                  innerRadius={
                    type === 'required'
                      ? outerRadius - 8
                      : outerRadius - RING_WIDTH / 2 + 2
                  }
                  outerRadius={type === 'required' ? 0 : outerRadius}
                  fill='transparent'
                  onMouseOver={e => {
                    !showDetails && setHoveredType(type);
                  }}
                />
                <FieldsArc
                  showTooltip={showTooltip}
                  hideTooltip={hideTooltip}
                  data={type === 'required' ? required : recommended}
                  hoveredType={hoveredType}
                  innerRadius={
                    (SIZE_WIDTH - (idx + RINGS_SPACING) * RING_WIDTH) / 2
                  }
                  outerRadius={outerRadius}
                  showDetails={showDetails}
                  setHoveredType={setHoveredType}
                  totalPercentage={getCoveragePercentage(hoveredType)}
                  {...typeDetails}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {tooltipOpen &&
        tooltipData &&
        tooltipLeft != null &&
        tooltipTop != null && (
          <TooltipInPortal
            key={Math.random()}
            left={0 + margin.left}
            top={width + 20}
          >
            <Box borderRadius='semi' minW='100px' maxW='200px'>
              <Text
                fontWeight='medium'
                bg={`${tooltipData.colorScheme}.500`}
                color='white'
                px={1}
                py={1}
              >
                {tooltipData.type.charAt(0).toUpperCase() +
                  tooltipData.type.slice(1)}
              </Text>
              <Stack mt={2} spacing={1} fontSize='xs'>
                <Text lineHeight='shorter'>
                  {tooltipData.value ? (
                    <>
                      <strong>{schema[tooltipData.field].name} </strong>
                      metadata is collected and available for{' '}
                      <Text as='span' bg={`${tooltipData.theme}.100`}>
                        {Math.round(tooltipData.value * 100)}%
                      </Text>{' '}
                      of resources from this source.
                    </>
                  ) : (
                    <>
                      <strong>{schema[tooltipData.field].name} </strong>{' '}
                      metadata was not found for this source.
                    </>
                  )}
                </Text>

                {tooltipData.augmented ? (
                  <Text lineHeight='shorter' mt={1}>
                    <strong>{schema[tooltipData.field].name} </strong>
                    was augmented for{' '}
                    <Text as='span' bg={`${tooltipData.theme}.100`}>
                      {Math.round(tooltipData.augmented * 100)}%
                    </Text>{' '}
                    of resources from this source.
                  </Text>
                ) : (
                  <></>
                )}
              </Stack>
            </Box>
          </TooltipInPortal>
        )}
      <Box
        position='absolute'
        left={`${width / 2}px`}
        top={`${width / 2 - 15}px`}
        userSelect='none'
        pointerEvents='none'
        textAlign='center'
      >
        <Text
          lineHeight='none'
          fontWeight='bold'
          fontSize='sm'
          transform='translate(-50%, 0%)'
          position='relative'
          color={hoveredType ? colorScale(hoveredType) : 'text.heading'}
          userSelect='none'
          pointerEvents='none'
          display='flex'
          flexDirection='column'
        >
          <Text as='span' color='inherit'>
            {getCoveragePercentage(hoveredType)}
            <Text as='span' fontSize='8px' color='inherit' position='absolute'>
              %
            </Text>
          </Text>
          <Text
            as='span'
            lineHeight='shorter'
            fontSize='11px'
            mt={1}
            color='inherit'
          >
            {hoveredType
              ? hoveredType === 'required'
                ? 'Fundamental'
                : 'Recommended'
              : 'field coverage'}
          </Text>
        </Text>
      </Box>
    </Box>
  );
};

// SCALES
const colorScale = scaleOrdinal<string, string>({
  range: [theme.colors.pink[500], theme.colors.secondary[500]],
  domain: ['required', 'recommended'],
});

const opacityScale = scaleLinear<number>({
  range: [0.3, 1],
  domain: [0, 1],
});

interface FieldDatum {
  value: number;
  field: string;
  type: 'required' | 'recommended';
  augmented: number | null;
}
type Fields = FieldDatum[];
let tooltipTimeout: number;
export const FieldsArc = ({
  colorScheme,
  data,
  innerRadius,
  hideTooltip,
  hoveredType,
  setHoveredType,
  showTooltip,
  label,
  outerRadius,
  showDetails,
  totalPercentage,
  type,
}: {
  colorScheme: string;
  data: Fields;
  innerRadius: number;
  hoveredType: FieldDatum['type'] | null;
  label: string;
  outerRadius: number;
  setHoveredType: (type: FieldDatum['type']) => void;
  showDetails: boolean;
  totalPercentage: number;
  type: FieldDatum['type'];
  showTooltip: (arg: any) => void;
  hideTooltip: () => void;
}) => {
  const isHovered = hoveredType === type;

  const ARCS_SPACING = data.length > 10 ? 0.03 : 0.05;

  const NUM_SEGMENTS = data.length;
  const ARC_STARTING_ANGLE = ARC_PI / NUM_SEGMENTS;

  const arcsData = data.map((data, idx) => {
    let startAngle = idx * ARC_STARTING_ANGLE;
    let endAngle = (idx + 1) * ARC_STARTING_ANGLE;
    return { data, startAngle, endAngle };
  });

  const nonEmptyArcData = arcsData.filter(({ data }) => data.value > 0);
  const handleMouseLeave = useCallback(() => {
    tooltipTimeout = window.setTimeout(() => {
      hideTooltip();
    }, 300);
  }, [hideTooltip]);

  return (
    <>
      <g
        className={'wheel-' + type}
        opacity={hoveredType !== null && hoveredType !== type ? 0.4 : 1}
      >
        {!isHovered && nonEmptyArcData.length > 0 && (
          <Arc
            id={'bg-arc-' + label}
            startAngle={nonEmptyArcData?.[0].startAngle}
            endAngle={ARC_PI * (totalPercentage / 100)}
            fill={theme.colors.gray[100]}
            padAngle={ARCS_SPACING}
            cornerRadius={4}
            innerRadius={outerRadius}
            outerRadius={0}
            opacity={0.4}
            pointerEvents='none'
          />
        )}
        {/* arc in background */}
        <Arc
          id={'total-bg-arc-' + label}
          startAngle={arcsData[0].startAngle}
          endAngle={arcsData[NUM_SEGMENTS - 1].endAngle}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill={theme.colors[colorScheme][200]}
          cornerRadius={4}
          padAngle={0}
          strokeWidth={1}
          opacity={showDetails || isHovered ? 0 : 0.2}
          pointerEvents='none'
        />
        {/* arc in foreground */}
        {nonEmptyArcData.length > 0 && (
          <Arc
            id={'total-arc-' + label}
            startAngle={nonEmptyArcData[0].startAngle}
            endAngle={nonEmptyArcData[nonEmptyArcData.length - 1].endAngle}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill={theme.colors[colorScheme][400]}
            padAngle={0}
            cornerRadius={4}
            opacity={showDetails || isHovered ? 0 : 1}
            pointerEvents='none'
          />
        )}

        {(showDetails || isHovered) && (
          <g>
            {/* arc fill */}
            {isHovered && nonEmptyArcData.length > 0 && (
              <Arc
                id={'bg-arc-' + label}
                startAngle={nonEmptyArcData[0].startAngle}
                endAngle={ARC_PI * (totalPercentage / 100)}
                fill={
                  isHovered ? theme.colors[colorScheme][100] : 'transparent'
                }
                padAngle={ARCS_SPACING}
                cornerRadius={4}
                innerRadius={outerRadius}
                outerRadius={0}
                opacity={0.4}
                pointerEvents='none'
              />
            )}
            {arcsData.map(({ data, startAngle, endAngle }) => {
              const fill =
                data.value === 0
                  ? `url(#${type}-lines)`
                  : colorScale(data.type);

              const opacity = data.value === 0 ? 1 : opacityScale(data.value);

              return (
                <React.Fragment key={`${type}-${data.field}`}>
                  {/* segmented arc */}
                  <Arc
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    padAngle={ARCS_SPACING}
                    cornerRadius={2}
                  >
                    {({ path }) => {
                      return (
                        <Box
                          as='g'
                          className='arc-segment'
                          onMouseOver={() => {
                            setHoveredType(type);

                            if (tooltipTimeout) clearTimeout(tooltipTimeout);

                            showTooltip({
                              tooltipLeft: path.centroid(path)[0],
                              tooltipTop: path.centroid(path)[1],
                              tooltipData: {
                                ...data,
                                colorScheme,
                                percent: `${Math.round(data.value * 100)}%`,
                              },
                            });
                          }}
                          onMouseLeave={handleMouseLeave}
                        >
                          <path
                            d={path(data) || ''}
                            fill={fill}
                            opacity={opacity}
                          />
                          {data.augmented && (
                            <Box
                              as='circle'
                              r={1.5}
                              cx={path.centroid(path)[0]}
                              cy={path.centroid(path)[1]}
                              fill='whiteAlpha.800'
                              stroke='white'
                              strokeWidth={1}
                              userSelect='none'
                            />
                          )}
                        </Box>
                      );
                    }}
                  </Arc>
                </React.Fragment>
              );
            })}
          </g>
        )}
      </g>
    </>
  );
};
