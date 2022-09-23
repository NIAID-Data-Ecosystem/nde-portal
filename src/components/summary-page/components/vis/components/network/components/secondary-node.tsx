import * as d3 from 'd3';
import { useEffect, useRef, useMemo } from 'react';
import { Datum, parameters } from './chart';
import { theme } from 'nde-design-system';
import { formatClassName, highlightNodes } from '../helpers';
import { SelectedFilterType } from 'src/components/filters/types';

interface SecondaryDatum extends Datum {
  primary: Datum;
}
interface SecondaryNodesProps {
  nodes: d3.HierarchyCircularNode<Datum>[];
  primaryNode: d3.HierarchyCircularNode<Datum>;
  isClusterOpen: boolean;
  filters: SelectedFilterType;
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  setHovered: (node: Datum | null) => void;
}

export const SecondaryNodes: React.FC<SecondaryNodesProps> = ({
  nodes: allNodes,
  primaryNode,
  isClusterOpen,
  filters,
  updateFilters,
  setHovered,
}) => {
  // const secondaryNodes = allNodes.filter(d => d.data.type === secondaryKey);
  const nodes = useMemo(
    () => allNodes.filter(d => d.data.type === 'measurementTechnique.name'),
    [allNodes],
  );
  const circlesRef = useRef(null);

  /****
   * D3 force
   */
  interface SimulationNode
    extends d3.SimulationNodeDatum,
      Omit<d3.HierarchyCircularNode<Datum>, 'x' | 'y'> {}

  /*
    Radial force applied to secondary nodes such that the nodes encircle the primary node.
  */

  useEffect(() => {
    const selector = `#${formatClassName(
      primaryNode.data.name,
    )} .secondary-nodes`;

    const simulation = d3
      .forceSimulation(nodes as SimulationNode[])
      .force(
        'collide',
        d3
          .forceCollide()
          .radius((node: any) => {
            return node.r + parameters.collisionPadding;
          })
          .iterations(5),
      )
      .force(
        'r',
        d3
          .forceRadial(
            () => {
              // use the primary node as the radial force added with the largest secondary node radius.
              return primaryNode.r + parameters.padding + nodes[0].r;
            },
            primaryNode.x,
            primaryNode.y,
          )
          .strength(0.5),
      )
      .on('tick', () => {
        d3.selectAll(selector).attr('transform', (d: any) => {
          return `translate(${d.x},${d.y})`;
        });
      })
      .stop();

    isClusterOpen && simulation.restart();
  }, [
    isClusterOpen,
    nodes,
    primaryNode.data.name,
    primaryNode.r,
    primaryNode.x,
    primaryNode.y,
  ]);

  /****
   * Draw secondary nodes
   */

  useEffect(() => {
    const isNodeSelected = (node: d3.HierarchyCircularNode<Datum>) => {
      // Check if primary node is currently selected.
      const isPrimarySelected =
        node.data.primary &&
        filters[node.data.primary.type].includes(node.data.primary.name);

      // Check if node representing secondary group is selected.
      const isSecondarySelected =
        node.data.primary &&
        !filters[node.data.primary.type].length &&
        filters[node.data.type].includes(node.data.name);

      // Node should display as selected if the node's parent or primary group is selected or if the node itself (secondary group) is selected and no primary is selected.

      return isPrimarySelected || isSecondarySelected;
    };
    const group = d3
      .select(circlesRef.current)
      .append('g')
      .attr('class', 'nodes');

    const circle_el = group
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', node => {
        return `node secondary-nodes ${formatClassName(node.data.name)} ${
          isNodeSelected(node) ? 'selected' : 'not-selected'
        }`;
      })
      .attr('fill', node => {
        // if cluster is closed, the nodes are transparent otherwise use the fill provided in the data.
        return !isClusterOpen ? 'transparent' : node.data.fill;
      })
      .attr('r', node => node.r)
      .attr('transform', d => {
        return `translate(${d.x},${d.y})`;
      })
      .style('cursor', 'pointer')
      .style('opacity', node => {
        // Show full opaque for secondary nodes when no filtering/selection is made or when the current node is selected.
        if (!Object.values(filters).flat().length || isNodeSelected(node)) {
          return parameters.opacity.full;
        } else {
          return parameters.opacity.low;
        }
      });

    // Interactions.
    circle_el
      .on('click', (_, node) => {
        // Update the selected filters on click.
        updateFilters({ [node.data.type]: [node.data.name] });
      })
      .on('mouseover', function (_, node) {
        // highlight all secondary nodes that share the same name.
        setHovered(node.data);
        const selector = `.secondary-nodes.${formatClassName(node.data.name)}`;
        highlightNodes(selector);
      })
      .on('mouseleave', function () {
        /* on mouse leave if no filter is applied, all nodes are full opacity. Otherwise only leave the selected node as full opacity and dim the others.
         */
        setHovered(null);
        !Object.values(filters).flat().length
          ? highlightNodes('.node')
          : highlightNodes('.selected');
      });

    return () => {
      d3.selectAll('.nodes').remove();
    };
  }, [filters, nodes, isClusterOpen, updateFilters, setHovered]);

  return <g className='secondary-nodes-cluster' ref={circlesRef}></g>;
};
