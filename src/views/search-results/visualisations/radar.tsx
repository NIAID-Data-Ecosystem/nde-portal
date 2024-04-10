import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { Point } from '@visx/point';
import { Line, LineRadial } from '@visx/shape';
import { Text } from '@visx/text';

const radarBorder = '#7766E7';
const radarBG = '#c5bff1';
export const dots = '#503ADE';
const silver = '#D5D5D5';
export const background = '#FFF';

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

const genPoints = (length: number, radius: number) => {
  const step = (Math.PI * 2) / length;
  return [...new Array(length)].map((_, i) => ({
    x: radius * Math.sin(i * step),
    y: radius * Math.cos(i * step),
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
      const xVal = scale(getValue(dataArray[i - 1])) * Math.sin(i * step);
      const yVal = scale(getValue(dataArray[i - 1])) * Math.cos(i * step);
      // points[i - 1] = { x: xVal, y: yVal };
      points[i - 1].x = xVal;
      points[i - 1].y = yVal;
      res += `${xVal},${yVal} `;
      return res;
    });

  return { points, pointString };
}

const defaultMargin = { top: 0, left: 20, right: 20, bottom: 0 };

export type RadarProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  levels?: number;
};

export const Radar = ({
  width,
  height,
  levels = 5,
  margin = defaultMargin,
  data,
}: RadarProps) => {
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
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
  const points = genPoints(data.length, radius);
  const polygonPoints = genPolygonPoints(data, d => yScale(d) ?? 0, y);
  const zeroPoint = new Point({ x: 0, y: 0 });

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
            strokeWidth={2}
            strokeOpacity={0.5}
            strokeLinecap='round'
          />
        ))}

        {[...new Array(data.length)].map((_, i) => {
          return (
            <React.Fragment key={`radar-line-${i}`}>
              {/* <Text
                x={points[i].x}
                y={points[i].y}
                angle={
                  (points[i].x < 0 ? 0 : 0) +
                  (Math.atan(points[i].y / points[i].x) * 180) / Math.PI
                }
                textAnchor={points[i].x < 0 ? 'start' : 'end'}
                fontSize='12px'
                fill='#858A8D'
                style={{ color: '#858A8D' }}
              >
                {polygonPoints.points[i].datum.name}
              </Text> */}
              <Line
                from={zeroPoint}
                to={points[i]}
                stroke={silver}
                strokeOpacity={0.5}
              />
            </React.Fragment>
          );
        })}
        <polygon
          points={polygonPoints.pointString}
          fill={radarBG}
          fillOpacity={0.3}
          stroke={radarBorder}
          strokeWidth={1}
        />
        {polygonPoints.points.map((point, i) => (
          <React.Fragment key={`radar-point-${i}`}>
            <circle id={i} cx={point.x} cy={point.y} r={4} fill={dots} />

            <Text
              // x={points[i].x}
              // y={points[i].y}
              x={point.x}
              y={point.y}
              // angle={
              //   (point.x < 0 ? 0 : 0) +
              //   (Math.atan(point.y / point.x) * 180) / Math.PI
              // }
              textAnchor={points[i].x < 0 ? 'start' : 'end'}
              fontSize='12px'
              fill='#858A8D'
              style={{ color: '#858A8D' }}
            >
              {data[i].name}
            </Text>
          </React.Fragment>
        ))}
      </Group>
    </svg>
  );
};
