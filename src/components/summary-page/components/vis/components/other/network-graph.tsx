// @ts-nocheck
import * as d3 from 'd3';
import React, { useRef, useEffect, useCallback, createRef } from 'react';

const parameters = {
  nodeId: d => d.id, // given d in nodes, returns a unique identifier (string)
  nodeGroup: d => d.group, // given d in nodes, returns an (ordinal) value for color
  nodeGroups: undefined,
  nodeTitle: d => `${d.id} (${d.numDatasets})`,
  nodeFill: 'currentColor', // node stroke fill (if not using a group color encoding)
  nodeStroke: '#fff', // node stroke color
  nodeStrokeWidth: 1.5, // node stroke width, in pixels
  nodeStrokeOpacity: 1, // node stroke opacity
  nodeRadius: 5, // node radius, in pixels
  linkSource: ({ source }) => source, // given d in links, returns a node identifier string
  linkTarget: ({ target }) => target, // given d in links, returns a node identifier string
  linkStroke: '#999', // link stroke color
  linkStrokeOpacity: 0.6, // link stroke opacity
  linkStrokeWidth: 1.5, // given d in links, returns a stroke width in pixels
  linkStrokeLinecap: 'round', // link stroke linecap
  colors: d3.schemeTableau10, // an array of color strings, for the node groups
  width: 885, // outer width, in pixels
  height: 680, // outer height, in pixels
};

function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
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

export const NetworkGraph = ({ data }) => {
  const svgRef = useRef(null);

  let {
    colors,
    width,
    height,
    linkSource,
    linkTarget,
    linkStroke,
    linkStrokeOpacity,
    linkStrokeWidth,
    linkStrokeLinecap,
    linkStrength,
    nodeFill,
    nodeGroup,
    nodeGroups,
    nodeId,
    nodeRadius,
    nodeStroke,
    nodeStrokeOpacity,
    nodeStrokeWidth,
    nodeTitle,
  } = parameters;

  function intern(value) {
    return value !== null && typeof value === 'object'
      ? value.valueOf()
      : value;
  }

  const infectious_agent_nodes = data.reduce((r, d, i) => {
    if (d.infectiousAgent) {
      d.infectiousAgent.map(t => {
        const infectious_agents = Array.isArray(t.name) ? t.name : [t.name];
        infectious_agents.map(name => {
          if (name) {
            if (!r[name]) {
              r[name] = {
                id: name,
                group: 'infectiousAgent',
                radius: 10,
                numDatasets: 0,
              };
            }
            r[name].radius += 2;
            r[name].numDatasets += 1;
          }
        });
      });
    }
    return r;
  }, {} as { [key: string]: { group: string; id: string; numDatasets: number; radius: number } });

  const measurement_technique_nodes = data.reduce((r, d, i) => {
    if (d.measurementTechnique) {
      d.measurementTechnique.map(t => {
        const mts = Array.isArray(t.name) ? t.name : [t.name];
        mts.map(name => {
          if (name) {
            if (!r[name]) {
              r[name] = {
                id: name,
                group: 'measurementTechnique',
                radius: 10,
                numDatasets: 0,
              };
            }
            r[name].radius += 2;
            r[name].numDatasets += 1;
          }
        });
      });
    }
    return r;
  }, {} as { [key: string]: { group: string; id: string; numDatasets: number; radius: number } });

  const nodes = infectious_agent_nodes &&
    measurement_technique_nodes && [
      ...Object.values(infectious_agent_nodes),
      ...Object.values(measurement_technique_nodes),
    ];

  const links =
    data &&
    Object.values(
      data.reduce((r, d, i) => {
        if (d.infectiousAgent) {
          d.infectiousAgent.map(ia => {
            // @ts-ignore
            d.measurementTechnique.map(mt => {
              if (!r[`${ia.name}-${mt.name}`]) {
                r[`${ia.name}-${mt.name}`] = {
                  source: ia.name,
                  target: mt.name,
                  value: 0,
                };
              }
              r[`${ia.name}-${mt.name}`].value += 2;
            });
          });
        }
        return r;
      }, {}),
    );

  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  const W =
    typeof linkStrokeWidth !== 'function'
      ? null
      : d3.map(links, linkStrokeWidth);

  // Construct the scales.

  const colorNodes = nodes
    .filter(n => n.group === 'infectiousAgent')
    .map(d => d.id);
  const color = d3.scaleOrdinal(colorNodes, colors);

  const forceNode = d3.forceManyBody();
  const forceLink = d3.forceLink(links).id(({ index: i }) => N[i]);

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

    const node = svg
      .append('g')
      .attr('class', 'network-nodes')
      .attr('stroke', nodeStroke)
      .attr('stroke-opacity', nodeStrokeOpacity)
      .attr('stroke-width', nodeStrokeWidth)
      .selectAll('g')
      .data(nodes)
      .join('g');

    // hover label text
    const labels = node.append('title').text(d => nodeTitle(d));
    const circles = node.append('circle').attr('fill', d => {
      if (d.group === 'infectiousAgent') {
        return color(d.id);
      } else {
        return 'blue';
      }
    });

    const links_g = svg
      .append('g')
      .attr('class', 'network-links')
      .attr('stroke', linkStroke)
      .attr('stroke-opacity', linkStrokeOpacity)
      .attr(
        'stroke-width',
        typeof linkStrokeWidth !== 'function' ? linkStrokeWidth : null,
      )
      .attr('stroke-linecap', linkStrokeLinecap)
      .selectAll('g')
      .data(links)
      .join('g');

    const link = links_g
      .append('line')
      .attr('stroke', d => {
        if (d.source) {
          return color(d.source);
        }
        return 'red';
      })
      .attr('stroke-width', d => {
        return d.source.numDatasets;
      });

    if (W) link.attr('stroke-width', ({ index: i }) => W[i]);

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      circles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.radius)
        .call(drag(simulation));

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('stroke', 'black');
    }

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', forceLink.distance(150))
      .force('charge', forceNode.strength(-250))
      .force('collide', d3.forceCollide(d => d.radius).iterations(10))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .on('tick', ticked);

    return () => {
      svg && svg.selectAll('.network-nodes').remove();
      svg && svg.selectAll('.network-links').remove();
    };
  }, [
    W,
    color,
    forceLink,
    forceNode,
    height,
    linkStroke,
    linkStrokeLinecap,
    linkStrokeOpacity,
    linkStrokeWidth,
    links,
    nodeStroke,
    nodeStrokeOpacity,
    nodeStrokeWidth,
    nodeTitle,
    nodes,
    width,
  ]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <svg
        id='network-graph'
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      ></svg>
    </div>
  );
};
