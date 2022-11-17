import * as d3 from 'd3';
import { theme } from 'nde-design-system';
import { useEffect, useRef } from 'react';
import { SelectedFilterType } from 'src/components/filters/types';
import { formatClassName, highlightNodes } from '../helpers';
import { Datum } from './chart';

interface WrapperNodeProps {
  node: d3.HierarchyCircularNode<Datum>;
  r: number;
  filters: SelectedFilterType;
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  setHovered: (node: Datum | null) => void;
}

// Styles for wrapper nodes.
export const parameters = {
  fill: theme.colors.white,
  fillOpacity: 0.1,
  stroke: 'transparent',
  label: {
    fill: theme.colors.whiteAlpha[700],
    size: 7,
    fontFamily: theme.fonts.body,
    fontSize: 10,
    fontWeight: 600,
  },
};

export const WrapperNode: React.FC<WrapperNodeProps> = ({
  node,
  r,
  filters,
  updateFilters,
  setHovered,
}) => {
  const labelRef = useRef(null);

  useEffect(() => {
    const mainNode = d3
      .select(labelRef.current)
      .append('g')
      .attr('class', 'wrapper');

    // circle that wraps primary and secondary nodes.
    const circleEl = mainNode
      .append('circle')
      .datum(node)
      .join('circle')
      .attr('class', () => `wrapper-circle node`)
      .attr('fill', parameters.fill)
      .attr('fill-opacity', parameters.fillOpacity)
      .attr('stroke', parameters.stroke)
      .attr('r', r)
      .attr('transform', d => {
        return `translate(${d.x},${d.y})`;
      })
      .on('mouseover', () => {
        // on hover make hovered nodes full opacity.
        const selector = `#${formatClassName(node.data.name)} .node`;
        highlightNodes(selector);

        setHovered(node.data);
      })
      .on('mouseleave', () => {
        !Object.values(filters).flat().length
          ? highlightNodes('.node')
          : highlightNodes('.selected');
        setHovered(null);
      })
      .style('pointer-events', 'all')
      .style('cursor', 'pointer');

    /*
      LABEL
    */

    // Path for label layout - info about how this is calculated can be found here: https://www.visualcinnamon.com/2015/09/placing-text-on-arcs/
    const curve_path =
      node.parent &&
      `m${node.x - node.parent.r + parameters.label.size} ${node.y} A${
        node.parent.r - parameters.label.size
      } ${node.parent.r - parameters.label.size} 0 0, 1, ${
        node.x + node.parent.r - parameters.label.size
      }, ${node.y}`;

    // Create circular path for label text to use.
    const label = mainNode.append('g').datum(node).attr('class', 'label');
    label
      .append('path')
      .attr('id', d => 'label-path' + d.data.name)
      .attr('d', () => curve_path)
      .style('fill', 'none');

    // Make text follow circular path
    label
      .append('text')
      .attr('class', 'label-text')
      .attr('dy', '0.1em')
      .append('textPath')
      .attr('fill', parameters.label.fill)
      .style('text-anchor', 'start')
      .style('font-size', parameters.label.fontSize)
      .style('font-weight', parameters.label.fontWeight)
      .style('font-family', parameters.label.fontFamily)
      .attr('xlink:href', d => '#label-path' + d.data.name)
      .text(function (d) {
        // only display if area is large enough by checking wrapper circle's radius
        return d.parent && d.parent.r > 25 ? d.data.name : '';
      });

    return () => {
      d3.selectAll('.wrapper').remove();
    };
  }, [node, r, filters, setHovered]);

  return (
    <g
      ref={labelRef}
      onClick={() => {
        // update filters on click.
        const v = { [node.data.type]: [node.data.name] };
        updateFilters(v);
      }}
    ></g>
  );
};
