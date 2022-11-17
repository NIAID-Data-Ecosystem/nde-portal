import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { SelectedFilterType } from 'src/components/filters/types';
import { Datum, parameters } from './chart';
import { formatClassName, highlightNodes } from '../helpers';

interface PrimaryNodesProps {
  isSelected: boolean;
  node: d3.HierarchyCircularNode<Datum>;
  filters: SelectedFilterType;
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  setHovered: (node: Datum | null) => void;
}
export const PrimaryNodes: React.FC<PrimaryNodesProps> = ({
  isSelected,
  node,
  filters,
  updateFilters,
  setHovered,
}) => {
  const primaryNodeRef = useRef(null);

  useEffect(() => {
    const mainNode = d3.select(primaryNodeRef.current);
    const circle_el = mainNode
      .append('circle')
      .datum(node)
      .join('circle')
      .attr(
        'class',
        d =>
          `node primary-nodes ${node.data.name} ${
            isSelected ? 'selected' : 'not-selected'
          }`,
      )
      .attr('stroke', node.data.stroke)
      .attr('stroke-width', parameters.primary.strokeWidth)
      .attr('fill', node.data.fill)
      .attr('fill-opacity', parameters.primary.fillOpacity)
      .style('cursor', 'pointer')
      .style('opacity', () => {
        // if no option is selected or current option is selected, set full opacity
        if (!Object.values(filters).flat().length || isSelected) {
          return parameters.opacity.full;
        } else {
          return parameters.opacity.low;
        }
      })
      .attr('r', node.r)
      .attr('transform', d => {
        return `translate(${d.x},${d.y})`;
      });

    circle_el
      .on('mouseover', function (_, node) {
        // on hover make hovered nodes full opacity.
        const selector = `#${formatClassName(node.data.name)} .node`;
        highlightNodes(selector);
        setHovered(node.data);
      })
      .on('mouseleave', function () {
        !Object.values(filters).flat().length
          ? highlightNodes('.node')
          : highlightNodes('.selected');
        setHovered(null);
      });

    return () => {
      d3.selectAll('.primary-nodes').remove();
    };
  }, [filters, isSelected, node, setHovered]);

  return (
    <g
      ref={primaryNodeRef}
      onClick={e => {
        // update filters on click.
        const v = { [node.data.type]: [node.data.name] };
        updateFilters(v);
      }}
    ></g>
  );
};
