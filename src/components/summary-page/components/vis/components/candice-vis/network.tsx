import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import * as d3 from 'd3';
import { theme, useBreakpointValue } from 'nde-design-system';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import {
  HierarchyCircularNode,
  SimulationLinkDatum,
  SimulationNodeDatum,
} from 'd3';
import data from './sample.json';
/**
 * Component, that renders a force layout for hierarchical data.
 */
interface NetworkDatum {
  name: string;
  children: { count: number; name: string; type: string; valueGroup: number }[];
}
interface NetworkProps {
  data: NetworkDatum[];
}

// interface PackData {
//   children: PackData[];
//   data: Pack;
//   depth: number;
//   height: number;
//   parent: PackData;
//   r: number;
//   value: number;
//   x: number;
//   y: number;
// }

// interface NodeData extends SimulationNodeDatum {
//   children: PackData[];
//   id: string;
//   name: string;
//   numDatasets: number;
//   group: string;
//   radius: number;
//   infectiousAgent: string | undefined;
// }
// interface LinkData {
//   value: number;
//   source: string | undefined;
//   target: string;
// }

export const Network: React.FC<NetworkProps> = ({ data }) => {
  const parameters = useMemo(
    () => ({
      width: { base: 500, md: 500 },
      height: { base: 500, md: 500 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      colors: d3.schemeTableau10,
      showMax: 10,
      padding: 4,
    }),
    [],
  );

  const svgRef = useRef(null);
  const wrapperRef = useRef(null);

  const dimensions = useMemo(() => ({ width: 600, height: 600 }), []);

  // will be called initially and on every data change/window re-size
  useEffect(() => {
    if (!dimensions) return;

    /****
     * Data
     * Pack data in a circle packing format.
     */

    //[NOTE]: value
    const packData = (data: { name: string; children: any }) =>
      d3.pack().size([dimensions.width, dimensions.height])(
        d3.hierarchy(data).sum((d: any) => d.count),
      ) as d3.HierarchyCircularNode<NetworkDatum>;

    const root: d3.HierarchyCircularNode<NetworkDatum> = packData({
      name: '',
      children: data,
    });

    /****
     * SVG Elements
     */
    const svg = d3
      .select(svgRef.current)
      .attr(
        'viewBox',
        `-${dimensions.width / 2} -${dimensions.height / 2} ${
          dimensions.width
        } ${dimensions.height}`,
      )
      .attr('viewBox', [
        -dimensions.width / 2,
        -dimensions.height / 2,
        dimensions.width,
        dimensions.height,
      ])
      .style('display', 'block')
      .style('margin', '0 -14px');

    const chart = svg.append('g').attr('class', 'network-chart');
    const chart_data = root.descendants().slice(1); // slice out overlay circle

    // Group together the nodes.
    const node_groups_data = chart_data.filter(d => d.depth === 1);
    const groups = chart
      .selectAll('.nodes-group')
      .data(node_groups_data)
      .enter()
      .append('g')
      .attr('class', 'nodes-group');

    // Circles wrapping the groups.
    const wrapping_circles = groups
      .append('circle')
      .attr('class', 'wrapper-circle')
      .attr('fill', theme.colors.whiteAlpha[600]);
    // .attr('r', node => node.r)
    // .attr('cx', node => node.x)
    // .attr('cy', node => node.y);
    // const nodes = groups
    //   .selectAll('.nodes')
    //   .data(d => {
    //     return d.children;
    //   })
    //   .enter()
    //   .append('circle')
    //   .attr('class', 'nodes')
    //   .attr('fill', theme.colors.blackAlpha[600])
    //   .attr('r', node => node.r)
    //   .attr('cx', node => node.x)
    //   .attr('cy', node => node.y);
    // nodes
    //   .append('title')
    //   .text(d => `${d.data.name}-(count: ${d.data.count})-(radius:${d.r})`);

    // Adjust the dimensions by a factor [k] so that the circles are always within the svg bounds.
    function zoomView(v: number[]) {
      const k = dimensions.width / v[2];
      groups.attr('transform', d => {
        return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`;
      });
      wrapping_circles.attr('r', node => node.r * k);
      // .attr('cx', node => node.x)
      // .attr('cy', node => node.y);
    }
    zoomView([root.x, root.y, root.r * 2]);

    return () => {
      svg.selectAll('.network-chart').remove();
    };
  }, [data, dimensions]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        maxWidth: '800px',
      }}
    >
      <svg ref={svgRef}></svg>
    </div>
  );
};
