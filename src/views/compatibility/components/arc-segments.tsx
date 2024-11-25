import React, { useCallback, useMemo, useState } from 'react';
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { MetadataSource } from 'src/hooks/api/types';
import { theme } from 'src/theme';
import { PatternLines } from '@visx/pattern';
import { Box, Stack, Text } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import { Arc } from '@visx/shape';
import Tooltip from 'src/components/tooltip';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

export type ArcSegmentsProps = {
  width: number;
  height: number;
  data: MetadataSource;
  margin?: { top: number; right: number; bottom: number; left: number };
};

// number of pie segments.
const NUM_SEGMENTS = 10;
const ARC_PI = (2 * Math.PI) / 2;
const ARC_STARTING_ANGLE = ARC_PI / NUM_SEGMENTS;
const RINGS_SPACING = 0.5;
const ARCS_SPACING = 0.03;

const segments = Array.from({ length: NUM_SEGMENTS }, (_, idx) => idx);
const arcsData = segments.map((_, idx) => {
  let startAngle = idx * ARC_STARTING_ANGLE;
  let endAngle = (idx + 1) * ARC_STARTING_ANGLE;
  return { startAngle, endAngle };
});

const defaultMargin = { top: 10, left: 10, right: 10, bottom: 15 };

export const ArcSegments = ({
  width,
  data,
  margin = defaultMargin,
}: ArcSegmentsProps) => {
  const required = useMemo(
    () =>
      Object.entries(
        data.sourceInfo.metadata_completeness?.required_fields,
      ).map(([field, value]) => {
        const augmented =
          data?.sourceInfo?.metadata_completeness
            ?.required_augmented_fields_coverage?.[field] || null;
        return {
          augmented,
          field,
          value: value < 0.1 ? Math.round(value) : value,
          type: 'required' as FieldDatum['type'],
        };
      }),
    [
      data.sourceInfo.metadata_completeness?.required_augmented_fields_coverage,
      data.sourceInfo.metadata_completeness?.required_fields,
    ],
  );
  const recommended = useMemo(
    () =>
      Object.entries(
        data.sourceInfo.metadata_completeness?.recommended_fields,
      ).map(([field, value]) => {
        const augmented =
          data?.sourceInfo?.metadata_completeness
            ?.recommended_augmented_fields_coverage?.[field] || null;
        return {
          augmented,
          field,
          value: value < 0.1 ? Math.round(value) : value,
          type: 'recommended' as FieldDatum['type'],
        };
      }),
    [
      data.sourceInfo.metadata_completeness
        ?.recommended_augmented_fields_coverage,
      data.sourceInfo.metadata_completeness?.recommended_fields,
    ],
  );

  const fields = useMemo(
    () =>
      [...required, ...recommended].sort((a, b) => {
        // First, sort by whether value is greater than 0 (descending, so items > 0 come first)
        if (a.value > 0 && b.value === 0) return -1;
        if (a.value === 0 && b.value > 0) return 1;

        // If both have values > 0 or both have values = 0, sort by type (descending)
        if (a.type > b.type) return -1;
        if (a.type < b.type) return 1;

        // sort by value in descending order within the same type
        return b.value - a.value;
      }),
    [required, recommended],
  );
  // number of layers/rings that extend outwards
  const NUM_RINGS = Math.ceil(fields.length / NUM_SEGMENTS);
  const rings = Array.from({ length: NUM_RINGS }, (_, idx) => idx);
  // The width of each ring is calculated based on the width of the svg and the number of rings
  const SIZE_WIDTH = width - margin.left - margin.right; // add margins here
  const SIZE_INNER = SIZE_WIDTH / 2;
  const RING_WIDTH = useMemo(
    () => (SIZE_WIDTH - SIZE_INNER) / NUM_RINGS,
    [NUM_RINGS, SIZE_INNER, SIZE_WIDTH],
  );

  // event handler
  const [selectedType, setSelectedType] = useState<FieldDatum['type'] | null>(
    null,
  );
  const handleMouseMove = useCallback(
    (
      _: React.MouseEvent | React.TouchEvent,
      type: FieldDatum['type'] | null,
    ) => {
      setSelectedType(type);
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setSelectedType(null);
  }, []);

  const getCoveragePercentage = useCallback(
    (selectedType: FieldDatum['type'] | null) => {
      if (selectedType === 'recommended') {
        return Math.round(
          (data.sourceInfo.metadata_completeness.sum_recommended_coverage /
            recommended.length) *
            100,
        );
      } else if (selectedType === 'required') {
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
          ((sum_recommended + sum_required) / fields.length) * 100,
        );
      }
    },
    [
      data.sourceInfo.metadata_completeness.sum_recommended_coverage,
      data.sourceInfo.metadata_completeness.sum_required_coverage,
      fields.length,
      recommended.length,
      required.length,
    ],
  );
  const getBackgroundArcIndex = () => {
    const fieldsWithValue = fields.filter(field => field.value > 0);
    return Math.ceil(fieldsWithValue.length / 3) - 1;
  };
  return (
    <Box
      width={width}
      height={width / 2}
      position='relative'
      mb={`${margin.bottom}px`}
      sx={{
        '.arc-segment:hover': {
          strokeWidth: 2,
          stroke: 'black',
        },
      }}
    >
      <svg width={width} height={width / 2} onMouseLeave={handleMouseLeave}>
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
          <Arc
            startAngle={arcsData[0].startAngle}
            endAngle={arcsData[arcsData.length - 1].endAngle}
            innerRadius={(SIZE_WIDTH - 0 * RING_WIDTH) / 2}
            outerRadius={(SIZE_WIDTH - 3 * RING_WIDTH) / 2}
            fill='transparent'
            onMouseLeave={handleMouseLeave}
          />
          {!selectedType && (
            <Arc
              startAngle={arcsData[0].startAngle}
              endAngle={ARC_PI * (getCoveragePercentage(selectedType) / 100)}
              innerRadius={(SIZE_WIDTH - 0 * (SIZE_WIDTH / NUM_RINGS)) / 2}
              outerRadius={(SIZE_WIDTH - 3 * (SIZE_WIDTH / NUM_RINGS)) / 2}
              onMouseLeave={handleMouseLeave}
              fill={theme.colors.gray[100]}
            />
          )}
          {rings.map((ring, idx) => {
            return (
              <g key={ring} className={'ring-' + idx}>
                <Ring
                  handleMouseMove={handleMouseMove}
                  selectedType={selectedType}
                  numRings={NUM_RINGS}
                  currentRingIndex={idx}
                  innerRadius={
                    (SIZE_WIDTH - (idx + RINGS_SPACING) * RING_WIDTH) / 2
                  }
                  outerRadius={(SIZE_WIDTH - idx * RING_WIDTH) / 2}
                  arcsData={arcsData}
                  fieldsData={fields}
                />
              </g>
            );
          })}
        </g>
      </svg>

      <Box
        position='absolute'
        left={`${width / 2}px`}
        top={`${width / 2 - width / 2 / 4}px`}
        transform='translate(-55%,0 )'
        textAlign='center'
      >
        <Text
          lineHeight='none'
          fontWeight='bold'
          color={
            selectedType
              ? selectedType === 'required'
                ? 'pink.500'
                : 'secondary.500'
              : 'gray.800'
          }
          fontSize='lg'
          display='flex'
          flexDirection='column'
        >
          <Text as='span'>
            {getCoveragePercentage(selectedType)}
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
            {selectedType
              ? selectedType === 'required'
                ? 'Fundamental'
                : 'Recommended'
              : 'Coverage'}
          </Text>
        </Text>
      </Box>
    </Box>
  );
};

interface FieldDatum {
  value: number;
  field: string;
  type: 'required' | 'recommended';
  augmented: number | null;
}
type Fields = FieldDatum[];

// SCALES
const colorScale = scaleOrdinal<string, string>({
  range: [theme.colors.pink[500], theme.colors.secondary[500]],
  domain: ['required', 'recommended'],
});

const opacityScale = scaleLinear<number>({
  range: [0.3, 1],
  domain: [0, 1],
});

const Ring = ({
  innerRadius,
  outerRadius,
  arcsData,
  fieldsData,
  currentRingIndex,
  numRings,
  handleMouseMove,
  selectedType,
}: {
  innerRadius: number;
  outerRadius: number;
  arcsData: { startAngle: number; endAngle: number }[];
  fieldsData: Fields;
  currentRingIndex: number;
  numRings: number;
  handleMouseMove: (e: React.MouseEvent, arg: FieldDatum['type']) => void;
  selectedType: FieldDatum['type'] | null;
}) => {
  return (
    <>
      {arcsData.map(({ startAngle, endAngle }, idx) => {
        const field_index = numRings - currentRingIndex - 1 + numRings * idx;
        const field = fieldsData[field_index];
        const type = field.type === 'required' ? 'Fundamental' : 'Recommended';
        const typeTheme = field.type === 'required' ? 'pink' : 'secondary';
        const getOpacity = () => {
          if (selectedType) {
            if (field.type === selectedType && field.value === 0) return 1;
            return field.type === selectedType
              ? opacityScale(field.value)
              : 0.2;
          } else {
            if (field.value === 0) {
              return 1;
            } else {
              return opacityScale(field.value);
            }
          }
        };
        const pattern =
          selectedType && selectedType === field.type
            ? `url(#${selectedType}-lines)`
            : theme.colors.gray[300];
        return (
          <React.Fragment key={idx}>
            <Arc
              className={'arc-' + idx}
              startAngle={startAngle}
              endAngle={endAngle}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              padAngle={ARCS_SPACING}
            >
              {({ path }) => {
                return (
                  <>
                    <Tooltip
                      borderRadius='semi'
                      border='none'
                      minW='100px'
                      maxW='200px'
                      py={1}
                      label={
                        <Box>
                          <Text
                            bg={`${typeTheme}.500`}
                            color='white'
                            px={1}
                            py={1}
                            fontSize='sm'
                          >
                            {type}
                          </Text>

                          <Stack mt={2} spacing={1} fontSize='xs'>
                            <Text lineHeight='shorter'>
                              {field.value ? (
                                <>
                                  <strong>{schema[field.field].name} </strong>
                                  metadata is collected and available for{' '}
                                  <Text as='span' bg={`${typeTheme}.100`}>
                                    {Math.round(field.value * 100)}%
                                  </Text>{' '}
                                  of resources from this source.
                                </>
                              ) : (
                                <>
                                  <strong>{schema[field.field].name} </strong>{' '}
                                  metadata was not found for this source.
                                </>
                              )}
                            </Text>

                            {field.augmented ? (
                              <Text lineHeight='shorter' mt={1}>
                                <strong>{schema[field.field].name} </strong>
                                was augmented for{' '}
                                <Text as='span' bg={`${typeTheme}.100`}>
                                  {Math.round(field.augmented * 100)}%
                                </Text>{' '}
                                of resources from this source.
                              </Text>
                            ) : (
                              <></>
                            )}
                          </Stack>
                        </Box>
                      }
                      position='absolute'
                      top={0}
                      left={0}
                    >
                      <Box
                        as='g'
                        className='arc-segment'
                        onMouseMove={(e: React.MouseEvent) => {
                          handleMouseMove(e, field.type);
                        }}
                      >
                        <Box
                          as='path'
                          id={field.type}
                          strokeWidth={2}
                          strokeOpacity={1}
                          d={path(field) || ''}
                          fill={
                            field.value === 0 ? pattern : colorScale(field.type)
                          }
                          opacity={getOpacity()}
                        />
                        {field.augmented && (
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
                    </Tooltip>
                  </>
                );
              }}
            </Arc>
          </React.Fragment>
        );
      })}
    </>
  );
};
