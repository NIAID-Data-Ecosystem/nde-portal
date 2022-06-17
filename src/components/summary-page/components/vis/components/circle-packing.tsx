import * as d3 from 'd3';
import { theme } from 'nde-design-system';
import React, { useRef, useEffect, useCallback, createRef } from 'react';
// @ts-nocheck

const PARAMETERS = {
  width: 1205,
  height: 1600,
  colors: [
    // theme.colors.accent.bg,
    theme.colors.primary['500'],

    'white',
    theme.colors.primary['500'],
    // theme.colors.accent.bg,
    // theme.colors.secondary['500'],
    // 'white',
    // 'yellow',
  ],
  // colors: d3.schemeTableau10,
  // stroke: 'white',
  // strokeWidth: 1,
  // strokeLinejoin: 'round',
  // fontColor: 'white',
  // linkStroke: '#999', // link stroke color
  // linkStrokeOpacity: 0.6, // link stroke opacity
  // linkStrokeWidth: 1.5, // given d in links, returns a stroke width in pixels
  // linkStrokeLinecap: 'round', // link stroke linecap
};
export const CirclePacking = ({ data }) => {
  const svgRef = useRef(null);
  const { width, height, colors } = PARAMETERS;

  // Format data.
  const infectiousAgentsList = [];

  const nodes = Object.values(
    data.reduce((r, d, i) => {
      if (d.infectiousAgent) {
        d.infectiousAgent.map(t => {
          const infectious_agents = Array.isArray(t.name) ? t.name : [t.name];
          infectious_agents.map(ia_name => {
            if (ia_name) {
              if (!r[ia_name]) {
                infectiousAgentsList.push(ia_name);
                r[ia_name] = {
                  id: ia_name,
                  name: ia_name,
                  group: 'infectiousAgent',
                  numDatasets: 0,
                  measurementTechniques: {},
                  children: [],
                };
              }
              r[ia_name].numDatasets += 1;

              if (d.measurementTechnique) {
                d.measurementTechnique.map(t => {
                  const mts = Array.isArray(t.name) ? t.name : [t.name];
                  mts.map(mt_name => {
                    if (mt_name) {
                      if (!r[ia_name]['measurementTechniques'][mt_name]) {
                        r[ia_name]['measurementTechniques'][mt_name] = {
                          id: `${ia_name}-${mt_name}`,
                          name: mt_name,
                          infectiousAgent: ia_name,
                          group: 'measurementTechnique',
                          numDatasets: 0,
                          children: [],
                        };
                      }
                      r[ia_name]['measurementTechniques'][
                        mt_name
                      ].children.push({
                        name: d.name,
                        value: 1,
                        dataset: d,
                      });
                      r[ia_name]['measurementTechniques'][
                        mt_name
                      ].numDatasets += 1;
                    }
                    r[ia_name]['children'].push(
                      r[ia_name]['measurementTechniques'][mt_name],
                    );
                  });
                });
              } else {
                r[ia_name]['children'].push({
                  name: d.name,
                  value: 1,
                  dataset: d,
                });
              }
            }
          });
        });
      }
      return r;
    }, {} as { [key: string]: { group: string; id: string; ia: string; name: string; numDatasets: number; radius: number } }),
  );

  const pack = datas =>
    d3
      .pack()
      .size([width, height])
      .padding(3)
      .radius(d => d.value * 0.5)(
        d3
          .hierarchy(datas)
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value),
      );
  const format = d3.format(',d');
  const color = d3.scaleOrdinal().domain([0, 3]).range(colors);

  useEffect(() => {
    const root = pack({ name: 'Summary', children: nodes });

    let focus = root;
    let view;

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `-${width / 2} -${height / 2} ${width} ${height}`)
      .style('display', 'block')
      .style('margin', '0 -14px')
      .style('cursor', 'pointer')
      .on('click', event => zoom(event, root));

    const node = svg
      .append('g')
      .attr('class', 'circle-packing-chart')
      .selectAll('circle')
      .data(root.descendants().slice(1))
      .join('circle')
      .attr('fill', d => {
        // if (d.data.group === 'infectiousAgent') {
        //   return 'transparent';
        // }
        return color(d.depth);
      })
      .attr('fill-opacity', d => {
        if (d.data.group === 'infectiousAgent') {
          return '0.5';
        }
        return '1';
      })
      .attr('stroke-width', d => {
        if (d.data.group === 'infectiousAgent') {
          return '1px';
        }
        return '0px';
      })
      .attr('stroke', d => {
        return color(d.depth);
      })
      .attr('pointer-events', d => (!d.children ? 'none' : null))
      .on('mouseover', function () {
        d3.select(this).attr('stroke', '#fff');
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', d => color(d.depth));
      })
      .on(
        'click',
        (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()),
      );

    const label = svg
      .append('g')
      .attr('class', 'labels')
      .style('font', '10px sans-serif')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(root.descendants())
      .join('text')
      .style('fill', 'orange')
      .style('fill-opacity', d => (d.parent === root ? 1 : 0))
      .style('display', d => (d.parent === root ? 'inline' : 'none'))
      .text(d => d.data.name);

    zoomTo([root.x, root.y, root.r * 2]);

    function zoomTo(v) {
      const k = width / v[2];

      view = v;

      label.attr(
        'transform',
        d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      node.attr(
        'transform',
        d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      node.attr('r', d => d.r * k);
    }

    function zoom(event, d) {
      const focus0 = focus;

      focus = d;

      const transition = svg
        .transition()
        .duration(event.altKey ? 7500 : 750)
        .tween('zoom', d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
          return t => zoomTo(i(t));
        });

      label
        .filter(function (d) {
          return d.parent === focus || this.style.display === 'inline';
        })
        .transition(transition)
        .style('fill-opacity', d => (d.parent === focus ? 1 : 0))
        .on('start', function (d) {
          if (d.parent === focus) this.style.display = 'inline';
        })
        .on('end', function (d) {
          if (d.parent !== focus) this.style.display = 'none';
        });
    }

    return () => {
      svg && svg.selectAll('.circle-packing-chart').remove();
      svg && svg.selectAll('.labels').remove();
    };
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <svg id='network-graph' ref={svgRef} width={width} height={height}></svg>
    </div>
  );
};
