// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FormattedResource } from 'src/utils/api/types';
import { Box, Divider, Flex, Heading, Text, theme } from 'nde-design-system';

/*
 [TO DO]:
 [] Add tooltips with number of resources in each type
 [] Add animation
*/

const PARAMETERS = {
  width: 1205,
  height: 680,
  // colors: [
  //   theme.colors.primary['500'],
  //   theme.colors.accent.bg,
  //   theme.colors.secondary['500'],
  // ],
  colors: d3.schemeTableau10,
  stroke: 'white',
  strokeWidth: 1,
  strokeLinejoin: 'round',
  fontColor: 'white',
  linkStroke: '#999', // link stroke color
  linkStrokeOpacity: 0.6, // link stroke opacity
  linkStrokeWidth: 1.5, // given d in links, returns a stroke width in pixels
  linkStrokeLinecap: 'round', // link stroke linecap
};

interface NetworkProps {
  data: FormattedResource[];
  // filterByType: (type: string) => void;
}

export const NetworkNoLabels: React.FC<NetworkProps> = ({ data }) => {
  const svgRef = useRef(null);
  const {
    width,
    height,
    colors,
    fontColor,
    strokeLinejoin,
    linkStroke,
    linkStrokeLinecap,
    linkStrokeOpacity,
    linkStrokeWidth,
  } = PARAMETERS;

  /****
   * Process Data
   *
   */
  const infectiousAgentsList: string[] = [];

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
                  ia: ia_name,
                  group: 'infectiousAgent',
                  radius: 40,
                  numDatasets: 0,
                };
              }
              r[ia_name].radius += 2;
              r[ia_name].numDatasets += 1;

              if (d.measurementTechnique) {
                d.measurementTechnique.map(t => {
                  const mts = Array.isArray(t.name) ? t.name : [t.name];
                  mts.map(mt_name => {
                    if (mt_name) {
                      if (!r[`${ia_name}-${mt_name}`]) {
                        r[`${ia_name}-${mt_name}`] = {
                          id: `${ia_name}-${mt_name}`,
                          name: mt_name,
                          ia: ia_name,
                          group: 'measurementTechnique',
                          radius: 2,
                          numDatasets: 0,
                        };
                      }
                      r[`${ia_name}-${mt_name}`].radius += 2;
                      r[`${ia_name}-${mt_name}`].numDatasets += 1;
                    }
                  });
                });
              }
            }
          });
        });
      }
      return r;
    }, {} as { [key: string]: { group: string; id: string; ia: string; name: string; numDatasets: number; radius: number } }),
  );
  const links = Object.values(
    data.reduce((r, d, i) => {
      if (d.infectiousAgent) {
        d.infectiousAgent.map(t => {
          const infectious_agents = Array.isArray(t.name) ? t.name : [t.name];
          infectious_agents.map(ia_name => {
            if (ia_name) {
              if (d.measurementTechnique) {
                d.measurementTechnique.map(t => {
                  const mts = Array.isArray(t.name) ? t.name : [t.name];
                  mts.map(mt_name => {
                    if (mt_name) {
                      if (!r[`${ia_name}-${mt_name}`]) {
                        r[`${ia_name}-${mt_name}`] = {
                          source: ia_name,
                          target: `${ia_name}-${mt_name}`,
                          value: 0,
                        };
                      }
                      r[`${ia_name}-${mt_name}`].value += 1;
                    }
                  });
                });
              }
            }
          });
        });
      }
      return r;
    }, {} as { [key: string]: { source: string; target: string; value: number } }),
  );

  /****
   * Network
   */
  const colorScale = d3
    .scaleOrdinal()
    .domain(infectiousAgentsList)
    .range(colors);

  function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
    function dragstarted(event: {
      active: any;
      subject: { fx: any; x: any; fy: any; y: any };
    }) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: { subject: { fx: any; fy: any }; x: any; y: any }) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: {
      active: any;
      subject: { fx: null; fy: null };
    }) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

    const chart_el = svg.append('g').attr('class', 'network-chart');
    const nodes_el = chart_el
      .append('g')
      .attr('class', 'network-nodes')
      .selectAll('g')
      .data(nodes)
      .join('g');

    const circles = nodes_el
      .append('circle')
      .attr('stroke-width', 2)
      .attr('stroke', d => {
        if (d.ia) {
          return colorScale(d.ia);
        }
        return 'gray';
      })
      .attr('fill', d => {
        if (d.ia) {
          return colorScale(d.ia);
        }
        return 'gray';
      })
      .attr('fill-opacity', d => {
        if (d.group === 'infectiousAgent') {
          return '0.5';
        }
        return '1';
      })
      .style('cursor', 'pointer');
    //   .on('mouseover', handleNodeMouseOver)
    //   .on('mouseout', handleNodeMouseOut);

    // function handleNodeMouseOver(e, d) {
    //   // expand labels
    // }

    // function handleNodeMouseOut(e, d) {
    //   // d3.select(this)
    //   //   .style('max-width', '100px')
    //   //   .html(d => `${d.ia.length > 15 ? `${d.ia.slice(0, 11)} ...` : d.ia}`)
    //   //   .style('transition', '0.3s ease-in-out!important');
    // }

    nodes_el
      .filter(d => d.group === 'measurementTechnique')
      .append('title')
      .text(d => `${d.name}(${d.numDatasets})`);

    const link = chart_el
      .append('g')
      .attr('class', 'network-links')
      .attr('stroke-opacity', linkStrokeOpacity)
      .attr('stroke-linecap', linkStrokeLinecap)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => {
        if (d.source) {
          return colorScale(d.source);
        }
        return 'gray';
      })
      .attr('stroke-width', d => d.value)
      .attr('opacity', 0);

    function ticked() {
      link
        .attr('x1', d => {
          return d.source.x;
        })
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      circles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.radius);

      nodes_el.call(drag(simulation));
    }
    const N = d3.map(nodes, d => d.id);
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id(({ index: i }) => N[i])
          .distance(50),
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('collide', d3.forceCollide(d => d.radius).iterations(10))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', ticked);

    return () => {
      svg.selectAll('.network-chart').remove();
      d3.selectAll('.name-label').remove();
    };
  }, [
    strokeLinejoin,
    nodes,
    width,
    height,
    linkStroke,
    linkStrokeOpacity,
    linkStrokeWidth,
    linkStrokeLinecap,
    links,
    colorScale,
  ]);

  return (
    <Box id='network-viz' position='relative' width={width} height={height}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height} `}
      ></svg>
    </Box>
  );
};
