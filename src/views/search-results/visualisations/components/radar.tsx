import React from 'react';
import { Box } from '@chakra-ui/react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Point } from '@visx/point';
import { Line, LineRadial } from '@visx/shape';
import { Text } from '@visx/text';
import { roundSvgPath } from '../helpers';
import { theme } from 'src/theme';

export const dots = '#503ADE';
const silver = '#D5D5D5';
export const background = '#FFF';

interface Datum {}

interface LetterFrequency {
  frequency: number;
}

const degrees = 360;

const y = (d: LetterFrequency) => d.frequency;

const genAngles = (length: number) =>
  [...new Array(length + 1)].map((_, i) => ({
    angle:
      i * (degrees / length) + (length % 2 === 0 ? 0 : degrees / length / 2),
  }));

const genPoints = (data: Datum[], radius: number) => {
  // Calculate the angle for each slice.
  const length = data.length;
  const step = (Math.PI * 2) / length;
  return [...new Array(length)].map((_, i) => ({
    x: radius * Math.sin(i * step + step),
    y: radius * Math.cos(i * step + step),
    datum: data[i],
  }));
};

function genPolygonPoints<Datum>(
  dataArray: Datum[],
  scale: (n: number) => number,
  getValue: (d: Datum) => number,
) {
  const step = (Math.PI * 2) / dataArray.length;
  const points: { x: number; y: number }[] = dataArray.map(datum => ({
    x: 0,
    y: 0,
    datum,
  }));
  const pointString: string = new Array(dataArray.length + 1)
    .fill('')
    .reduce((res, _, i) => {
      if (i > dataArray.length) return res;
      const xVal = Math.round(
        scale(getValue(dataArray[i - 1])) * Math.sin(i * step),
      );
      const yVal = Math.round(
        scale(getValue(dataArray[i - 1])) * Math.cos(i * step),
      );
      // points[i - 1] = { x: xVal, y: yVal };
      points[i - 1].x = xVal;
      points[i - 1].y = yVal;
      res += `${xVal},${yVal} `;
      return res;
    });

  return { points, pointString, data: dataArray };
}

const defaultMargin = { top: 0, left: 80, right: 80, bottom: 0 };

export type RadarProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  levels?: number;
};

export const Radar = ({
  width,
  height,
  levels = 3,
  margin = defaultMargin,
  data,
}: RadarProps) => {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // The radius of the radar chart is half the minimum of the width and height.
  const radius = Math.min(xMax, yMax) / 2;

  const radialScale = scaleLinear<number>({
    range: [0, Math.PI * 2],
    domain: [degrees, 0],
  });

  const yScale = scaleLinear<number>({
    range: [0, radius],
    domain: [0, Math.max(...data.map(y))],
  });
  const webs = genAngles(data.length);
  const pointsRadius = radius + radius / 20;
  const points = genPoints(data, pointsRadius);
  const polygonPoints = genPolygonPoints(data, d => yScale(d) ?? 0, y);
  const zeroPoint = new Point({ x: 0, y: 0 });

  const path = `M${polygonPoints.points
    .map(point => `${point.x} ${point.y}`)
    .join(' L ')}Z`;
  const r = 10;
  const roundedPath = roundSvgPath(path, r);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect fill={background} width={width} height={height} rx={14} />
      <Group top={height / 2 - margin.top} left={width / 2}>
        {[...new Array(levels)].map((_, i) => (
          <LineRadial
            key={`web-${i}`}
            data={webs}
            angle={d => radialScale(d.angle) ?? 0}
            radius={((i + 1) * radius) / levels}
            fill='none'
            stroke={silver}
            strokeWidth={1}
            strokeOpacity={0.6}
            strokeDasharray='4 6'
          />
        ))}

        {points.map((point, i) => {
          return (
            <React.Fragment key={`radar-line-${i}`}>
              {/* Label option 1 */}
              {/* <Text
                x={points[i].x}
                y={points[i].y}
                angle={
                  (points[i].x < 0 ? 0 : 0) +
                  (Math.atan(points[i].y / points[i].x) * 180) / Math.PI
                }
                textAnchor={points[i].x < 0 ? 'start' : 'end'}
                fontSize='10px'
                fill='#858A8D'
                style={{ color: '#858A8D' }}
              >
                {point.datum.name}
              </Text> */}
              {/* Label option 2 */}

              <Text
                x={points[i].x}
                y={points[i].y}
                width={100}
                dx={
                  Math.abs(points[i].y) === pointsRadius
                    ? '0'
                    : points[i].x > 0
                    ? '1.75rem'
                    : '-1.95rem'
                }
                dy={points[i].y > 0 ? '2.5rem' : '-0.95rem'}
                textAnchor='middle'
                style={{
                  fontWeight: theme.fontWeights.medium,
                  textAlign: 'center',
                }}
                lineHeight='1rem'
                fontSize='12px'
                fill='#414141'
              >
                {point.datum.name}
              </Text>
              <Line
                from={zeroPoint}
                to={points[i]}
                stroke={silver}
                strokeWidth={1}
                strokeOpacity={0.6}
              />
            </React.Fragment>
          );
        })}

        <Box
          as='path'
          d={roundedPath}
          fill='secondary.500'
          fillOpacity={0.15}
          strokeWidth='2'
          strokeLinecap='round'
          stroke='secondary.300'
        />

        {polygonPoints.points.map((point, i) => (
          <React.Fragment key={`radar-point-${i}`}>
            {/* <circle cx={point.x} cy={point.y} r={4} fill={dots} /> */}
            {/* <Text
              x={point.x}
              y={point.y}
              textAnchor={points[i].x < 0 ? 'start' : 'end'}
              fontSize='12px'
              fill='#858A8D'
              style={{ color: '#858A8D' }}
            >
              {data[i].name}
            </Text> */}
          </React.Fragment>
        ))}
      </Group>
    </svg>
  );
};
