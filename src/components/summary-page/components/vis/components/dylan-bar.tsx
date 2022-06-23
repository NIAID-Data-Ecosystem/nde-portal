// @ts-nocheck

import React, { useEffect, useState } from 'react'
import { Chart as ChartJS, BarElement, LinearScale, CategoryScale, TimeScale } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    TimeScale,
    ChartDataLabels
)


const plugins = [
    {
        afterDraw: function (chart) {
            if (chart.data.datasets[0].data.length < 1) {
                let ctx = chart.ctx;
                let width = chart.width;
                let height = chart.height;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = 'white';
                ctx.font = "30px Public Sans";
                ctx.fillText("No data to display", width / 2, height / 2);
                ctx.restore();
            }
        },
    },
    // {
    //     afterFit: (chart, options) => {
    //         if (chart.legend.margins) {
    //             // Put some padding around the legend/labels
    //             chart.legend.options.labels.padding = 52229;
    //             // Because you added 20px of padding around the whole legend,
    //             // you will need to increase the height of the chart to fit it
    //             chart.height += 222;
    //         }
    //     }
    // }
];

const DylanBarChart = ({ data, options }) => {
    return (
        <Bar
            // height={175}
            data={data}
            options={options}
            plugins={plugins}
        />
    )
}
export default DylanBarChart
