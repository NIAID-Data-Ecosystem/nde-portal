import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { theme, Text, Heading } from 'nde-design-system';
import { roundCount } from '../helpers';
import { SelectedFilterType } from 'src/components/summary-page/components/hooks';

/**
 * Component that helps visualize data between two groups by displaying them in a circle pack and applying a force to the nodes.
 */
interface Datum {
  id: string;
  name: string;
  count: number;
  type: string;
  primaryGroup?: string;
}

interface Data {
  name: string;
  children: Datum[];
}

interface NetworkProps {
  data: Data[];
  keys: string[];
  filters: SelectedFilterType;
  updateFilters: (updatedFilters: SelectedFilterType) => void;
}

export const Nodes: React.FC<NetworkProps> = ({ data, keys }) => {
  // Strings representing each group shown in viz where group two is grouped by group one.
  const [primary_group_key, secondary_group_key] = keys;
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const dimensions = useMemo(() => ({ width: 600, height: 600 }), []);

  // Params for viz
  const parameters = useMemo(
    () => ({
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      colors: d3.schemeTableau10,
      padding: 10,
      scaleFactor: 1.5,
      collisionPadding: 2,
    }),
    [],
  );

  // will be called initially and on every data change/window re-size
  useEffect(() => {
    if (!dimensions) return;

    /****
     * Process Data
     * Format data for packing in a circular packing format.
     */
    const packData = (data: { name: string; children: Data[] }) =>
      d3
        .pack()
        .size([dimensions.width, dimensions.height])
        .padding(parameters.padding)(
        d3.hierarchy(data).sum((d: any) => {
          // round count to add uniformity to circles
          return roundCount(d.count);
        }),
      ) as d3.HierarchyCircularNode<Datum>;

    const root: d3.HierarchyCircularNode<Datum> = packData({
      name: 'root',
      children: data,
    });

    /****
     * Render SVG elements
     */
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', [
        -dimensions.width / 2,
        -dimensions.height / 2,
        dimensions.width,
        dimensions.height,
      ])
      .style('display', 'block')
      .style('margin', '0 -14px');

    const chart = svg.append('g').attr('class', 'network-chart');
    const chart_data = root.descendants().slice(1); // remove root overlay circle from data.

    // Group together the nodes
    const depth_one_data = chart_data.filter(d => d.depth === 1);

    const grouped_nodes = chart
      .selectAll('.nodes-group')
      .data(depth_one_data)
      .enter()
      .append('g')
      .attr('class', 'nodes-group');

    // Circles around the node clusters.
    const wrapping_circles = grouped_nodes
      .append('circle')
      .attr('class', 'wrapper-circle')
      .attr('fill', theme.colors.whiteAlpha[200])
      .attr('r', node => node.r)
      .attr('transform', d => {
        return `translate(${d.x - root.x},${d.y - root.y})`;
      });

    /*
     [Secondary nodes]: Nodes belonging to the secondary group.
    */
    const secondary_nodes_data = depth_one_data.map(datum => {
      if (!datum || !datum.children) {
        return [];
      }
      return datum.children
        .filter(c => c.data.type === secondary_group_key)
        .map(d => {
          return {
            ...d,
            x: d.parent!.x - root.x,
            y: d.parent!.y - root.y,
          };
        });
    });

    const secondary_nodes = grouped_nodes
      .selectAll('.secondary-nodes')
      .data((_, i) => secondary_nodes_data[i])
      .enter()
      .append('circle')
      .attr('class', 'secondary-nodes')
      .attr('stroke', 'black')
      .attr('fill', theme.colors.cyan[500])
      .attr('r', node => node.r / parameters.scaleFactor)
      .attr('transform', d => {
        return `translate(${d.x},${d.y})`;
      });

    secondary_nodes.append('title').text(d => {
      if (!d.parent) {
        return '';
      }
      return `${d.parent.data.name}-${d.data.name}-(count: ${d.data.count})-(radius:${d.r})`;
    });

    /*
     [Primary nodes]: Nodes belonging to the primary group.
    */
    const primary_nodes_data = depth_one_data
      .map(datum => {
        if (!datum || !datum.children) {
          return [];
        }
        return datum.children.filter(c => {
          return c.data.type === primary_group_key;
        });
      })
      .flat();

    const primary_nodes = grouped_nodes
      .selectAll('.primary-nodes')
      .data((_, i) => primary_nodes_data[i])
      .enter()
      .append('circle')
      .attr('class', 'primary-nodes')
      .attr('stroke-width', 2)
      .attr('stroke', (node, i) => theme.colors.purple[600])
      .attr('fill', (node, i) => theme.colors.purple[600])
      .attr('r', node => node.r / parameters.scaleFactor)
      .attr('transform', d => {
        if (!d.parent) {
          return `translate(0,0)`;
        }
        // We want to center the primary nodes to the wrapping circles center
        return `translate(${d.parent.x - root.x},${d.parent.y - root.y})`;
      })
      .on('click', (e, d) => {
        const name = d.data.name;

        const i = secondary_nodes_data.findIndex(n => {
          return n[0].data.primaryGroup === name;
        });
        if (i) {
          const updateValues = secondary_nodes_data[i];
          const sim = updateValues && simulation(updateValues);
          sim && sim.restart();
        }
      });

    // [TO DO]: Remove when labels are added
    primary_nodes
      .append('title')
      .text(d => `${d.data.name}-(count: ${d.data.count})-(radius:${d.r})`);

    interface SimulationNode
      extends d3.SimulationNodeDatum,
        Omit<d3.HierarchyCircularNode<Datum>, 'x' | 'y'> {}

    const simulation = (nodes: SimulationNode[]) => {
      if (!nodes[0].parent || !nodes[0].parent.children) {
        return null;
      }
      // Get the radius of the primary group node to use as the radial force.
      const primary_group_node = nodes[0].parent.children.filter(
        c => c.data.type === primary_group_key,
      )[0];
      const rad = (primary_group_node.r || 1) / parameters.scaleFactor;

      // x and y position of the parent node, used as center for radial force.
      const pos = nodes[0].parent;
      const x = pos.x - root.x;
      const y = pos.y - root.y;

      return d3
        .forceSimulation(nodes)
        .force(
          'collide',
          d3.forceCollide().radius((node: any) => {
            return (
              node.r / parameters.scaleFactor + parameters.collisionPadding
            );
          }),
        )
        .force(
          'r',
          d3
            .forceRadial(
              () => rad * parameters.scaleFactor + parameters.padding,
              x,
              y,
            )
            .strength(0.5),
        )
        .on('tick', () => {
          d3.selectAll('.secondary-nodes')
            .filter((d: any) => d.data.primaryGroup === 'Microbiota')
            .attr('transform', (d: any) => {
              return `translate(${d.x},${d.y})`;
            });
          // secondary_nodes.attr('transform', d => {
          //   return `translate(${d.x},${d.y})`;
          // });
        })
        .stop();
    };

    // const grouped_mt = d3.group(
    //   secondary_nodes_data.flat(),
    //   s => s.parent?.data.name,
    // );

    // Array.from(grouped_mt).map(([_, values]) => {
    //   simulation(values);
    // });

    return () => {
      svg.selectAll('.network-chart').remove();
    };
  }, [
    data,
    dimensions,
    primary_group_key,
    secondary_group_key,
    keys,
    parameters,
  ]);

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
