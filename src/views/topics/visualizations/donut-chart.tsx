import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { FacetTerm } from 'src/utils/api/types';
import { scaleLog, scaleOrdinal } from 'd3-scale';
import { pie, arc } from 'd3-shape';
import { select, selectAll } from 'd3-selection';
import { max } from 'd3-array';

// export const PieChart = ({ data }: { data: FacetTerm[] }) => {
//   const total = d3.sum(data, d => d.count);
// const typeColorScale =  d3
// .scaleOrdinal()
// .domain(data.map((d) => d.term))
// .range(["#e8c543", "#ff8359", "#6e95fc"])
//   return <Box>Pie Chart</Box>;
// };

export const DonutChart = ({ data }: { data: FacetTerm[] }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 200;
    const height = Math.min(width, 500);
    const innerRadius = 70;

    const typeColorScale = scaleOrdinal()
      .domain(data.map(d => d.term))
      .range(['#e8c543', '#ff8359', '#6e95fc']);

    // Clear any previous chart
    select(ref.current).selectAll('*').remove();

    const logScale = scaleLog()
      .domain([1, max(data, d => d.count) || 1])
      .range([1, 100]);

    const transformedData = data.map(d => ({
      ...d,
      logCount: logScale(d.count),
    }));

    const getPie = pie<any>()
      .sort(null)
      .value(d => d.logCount);
    const getArc = arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(Math.min(width, height) / 2 - 1);

    const labelRadius = getArc.outerRadius()() * 0.8;
    const arcLabel = arc<any>()
      .innerRadius(labelRadius)
      .outerRadius(labelRadius);

    const arcs = getPie(transformedData);

    const svg = select(ref.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto; font: 12px sans-serif;');

    svg
      .append('g')
      .attr('stroke', 'white')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('class', 'arc')
      .attr('fill', d => typeColorScale(d.data.term))
      .attr('d', getArc)
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        selectAll('.arc').style('opacity', 0.3);
        select(this).style('opacity', 1);
      })
      .on('mouseout', function () {
        selectAll('.arc').style('opacity', 1);
      })
      // .on('click', (event, d) => {
      //   const url = `${portalUrl}/search?q=${querystring}&from=1&filters=%28%40type%3A%28"${d.data.term}"%29%29`;
      //   window.open(url, '_blank');
      // })
      .append('title')
      .text(
        d =>
          `${
            d.data.term
          }: ${d.data.count.toLocaleString()}\n🔍 Click to see search results of this type.`,
      );

    // (Optional) Add labels:
    // svg
    //   .append("g")
    //   .attr("text-anchor", "middle")
    //   .selectAll("text")
    //   .data(arcs)
    //   .join("text")
    //   .attr("transform", (d) => `translate(${arcLabel.centroid(d)})`)
    //   .call((text) =>
    //     text
    //       .append("tspan")
    //       .attr("y", "-0.4em")
    //       .attr("font-weight", "bold")
    //       .text((d) => d.data.term)
    //   )
    //   .call((text) =>
    //     text
    //       .append("tspan")
    //       .attr("x", 0)
    //       .attr("y", "0.7em")
    //       .attr("fill-opacity", 0.7)
    //       .text((d) => d.data.count.toLocaleString("en-US"))
    //   );
  }, [data]);

  return <svg ref={ref}></svg>;
};
