import React from 'react';
import { TreeNode } from './helpers';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinkHorizontal } from '@visx/shape';

// For Zoom component: https://airbnb.io/visx/zoom-i
const defaultMargin = { top: 50, left: 80, right: 100, bottom: 50 };

export const TopicBrowser = ({
  data: tree,
  width: totalWidth = 800,
  height: totalHeight = 480,
  margin = defaultMargin,
}: {
  data: TreeNode;
  margin?: { top: number; right: number; bottom: number; left: number };
  width?: number;
  height?: number;
}) => {
  const data = tree?.children?.[0];

  // const forceUpdate = useForceUpdate();

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;

  const origin = { x: 0, y: 0 };
  const sizeWidth = innerHeight;
  const sizeHeight = innerWidth;

  return !data || totalWidth < 10 ? null : (
    <svg width={totalWidth} height={totalHeight}>
      <LinearGradient id='links-gradient' from='#fd9b93' to='#fe6e9e' />
      <rect width={totalWidth} height={totalHeight} rx={14} fill='#272b4d' />
      <Group top={margin.top} left={margin.left}>
        <Tree
          root={hierarchy(data, d => (d.isExpanded ? null : d.children))}
          size={[sizeWidth, sizeHeight]}
          separation={(a, b) => (a.parent === b.parent ? 1 : 0.5) / a.depth}
        >
          {tree => (
            <Group top={origin.y} left={origin.x}>
              {tree.links().map((link, i) => (
                <LinkHorizontal
                  key={i}
                  data={link}
                  stroke='rgb(254,110,158,0.6)'
                  strokeWidth='1'
                  fill='none'
                />
              ))}

              {tree.descendants().map((node, key) => {
                const width = 40;
                const height = 20;

                let top = node.x;
                let left = node.y;

                return (
                  <Group top={top} left={left} key={key}>
                    {node.depth === 0 && (
                      <circle
                        r={12}
                        fill="url('#links-gradient')"
                        // onClick={() => {
                        //   node.data.isExpanded = !node.data.isExpanded;
                        //   // console.log(node);
                        //   // forceUpdate();
                        // }}
                      />
                    )}
                    {node.depth !== 0 && (
                      <rect
                        height={height}
                        width={width}
                        y={-height / 2}
                        x={-width / 2}
                        fill='#272b4d'
                        stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                        strokeWidth={1}
                        strokeDasharray={node.data.children ? '0' : '2,2'}
                        strokeOpacity={node.data.children ? 1 : 0.6}
                        rx={node.data.children ? 0 : 10}
                        // onClick={() => {
                        //   node.data.isExpanded = !node.data.isExpanded;
                        //   // console.log(node);
                        //   // forceUpdate();
                        // }}
                      />
                    )}
                    <text
                      dy='.33em'
                      fontSize={9}
                      fontFamily='Arial'
                      textAnchor='middle'
                      style={{ pointerEvents: 'none' }}
                      fill={
                        node.depth === 0
                          ? '#71248e'
                          : node.children
                          ? 'white'
                          : '#26deb0'
                      }
                    >
                      {node.data.name}
                    </text>
                  </Group>
                );
              })}
            </Group>
          )}
        </Tree>
      </Group>
    </svg>
  );
};
