import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
  useEffect,
} from 'react';
import * as d3 from 'd3';
import { Box, Checkbox, theme } from 'nde-design-system';
import { formatClassName } from '../helpers';
import { PrimaryNodes } from './primary-node';
import { SecondaryNodes } from './secondary-node';
import { WrapperNode } from './wrapper-node';
import { options } from '../index';
import { SelectedFilterType } from 'src/components/filters/types';
/**
 * Component that helps visualize data between two groups by displaying them in a circle pack and applying a force to the nodes.
 */
export interface Datum {
  id: string;
  name: string;
  count: number;
  type: string;
  primary?: Datum;
  stroke: string;
  fill: string;
  [key: string]: any;
}

export interface Data {
  name: string;
  children: Datum[];
}

interface NetworkProps {
  data: Data[];
  keys: string[];
  filters: SelectedFilterType;
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  setHovered: (node: Datum | null) => void;
}

// Fixed styling params for viz.
export const parameters = {
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  colors: d3.schemeTableau10,
  padding: 5,
  scaleFactor: 1.5,
  collisionPadding: 3,
  strokeWidth: 2,
  opacity: {
    full: 1,
    low: 0.4,
    none: 0,
  },
  primary: {
    fillOpacity: 0.4,
    fill: theme.colors.white,
    getColor: (i: number) => (i < 10 ? d3.schemeTableau10[i] : null),
    stroke: theme.colors.white,
    strokeWidth: 2,
  },
  secondary: {
    fill: theme.colors.white,
    fillOpacity: 1,
    stroke: 'transparent',
    strokeWidth: 0,
  },
};

export const Chart: React.FC<NetworkProps> = ({
  data,
  keys,
  filters,
  updateFilters,
  setHovered,
}) => {
  // User toggles checkbox to show a more detailed view(i.e. show all secondary nodes).
  const [isClusterOpen, setIsClusterOpen] = useState(false);

  // Strings representing each facet shown in the viz. Note that group two items are grouped/faceted by group one.
  const [primaryKey] = keys;
  const svgRef = useRef(null);
  const clusterRef = useRef(null);
  const wrapperRef = useRef(null);
  const dimensions = useMemo(() => ({ width: 600, height: 600 }), []);

  /****
   * Process Data
   * Format data for packing in a circular packing format.
   */
  const packData = useCallback(
    (data: { name: string; children: Data[] }) =>
      d3
        .pack()
        .size([dimensions.width, dimensions.height])
        .padding(parameters.padding)(
        d3.hierarchy(data).sum((d: any) => {
          // helpers roundCount to round circle radius
          return d.count;
        }),
      ) as d3.HierarchyCircularNode<Datum>,
    [dimensions.height, dimensions.width],
  );

  const root: d3.HierarchyCircularNode<Datum> = useMemo(
    () =>
      packData({
        name: 'root',
        children: data,
      }),
    [data, packData],
  );

  /****
   * Render SVG elements
   */

  const chart_data = useMemo(() => root.descendants().slice(1), [root]); // removes root overlay circle from data.

  // Group all nodes by primary value.
  const nodesGroupedByPrimaryName = useMemo(() => {
    const scaleRadius = (r: number) => r / parameters.scaleFactor;
    return d3.group(
      chart_data
        .filter(d => d.depth === 2)
        .map(d => {
          return {
            ...d,
            r: scaleRadius(d.r),
            x: d.parent!.x - root.x,
            y: d.parent!.y - root.y,
          };
        }),
      d => (d.data.type === primaryKey ? d.data.name : d.data.primary?.name),
    );
  }, [chart_data, primaryKey, root.x, root.y]);

  return (
    <Box p={6} flex={2}>
      <div
        ref={wrapperRef}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          maxWidth: '500px',
        }}
      >
        <svg
          id='svg-node'
          ref={svgRef}
          viewBox={`${-dimensions.width / 2} ${-dimensions.height / 2} ${
            dimensions.width
          } ${dimensions.height}`}
          style={{ display: 'block' }}
        >
          <g id='network-chart'>
            {/* Map over primary values */}
            {chart_data
              .filter(d => d.depth === 1)
              .map(node => {
                if (!node.parent) {
                  return;
                }

                const primaryNode = nodesGroupedByPrimaryName
                  .get(node.data.name)
                  ?.filter(d => d.data.type === primaryKey)[0];

                const isPrimarySelected = filters[primaryKey].includes(
                  node.data.name,
                );

                return (
                  <g
                    id={`${formatClassName(node.data.name)}`}
                    key={`${node.data.name}`}
                    className='grouped-nodes'
                    ref={clusterRef}
                  >
                    {/* circle shape wrapping the primary and secondary group nodes. */}
                    {primaryNode && (
                      <WrapperNode
                        node={primaryNode}
                        filters={filters}
                        r={node.r}
                        updateFilters={updateFilters}
                        setHovered={setHovered}
                      />
                    )}
                    {/* Display nodes from secondary group */}
                    {primaryNode && nodesGroupedByPrimaryName && (
                      <SecondaryNodes
                        nodes={
                          nodesGroupedByPrimaryName.get(node.data.name) || []
                        }
                        primaryNode={primaryNode}
                        isClusterOpen={isClusterOpen || isPrimarySelected}
                        filters={filters}
                        updateFilters={updateFilters}
                        setHovered={setHovered}
                      />
                    )}

                    {/* Display nodes from primary group */}
                    {primaryNode && (
                      <PrimaryNodes
                        isSelected={isPrimarySelected}
                        node={primaryNode}
                        filters={filters}
                        updateFilters={updateFilters}
                        setHovered={setHovered}
                      />
                    )}
                  </g>
                );
              })}
          </g>
          <g className='primary-label'></g>
        </svg>
      </div>
      <Checkbox
        isChecked={!isClusterOpen}
        mt={4}
        onChange={() => setIsClusterOpen(!isClusterOpen)}
        color='whiteAlpha.800'
      >
        Show {options[primaryKey]['name']} nodes only
      </Checkbox>
    </Box>
  );
};
