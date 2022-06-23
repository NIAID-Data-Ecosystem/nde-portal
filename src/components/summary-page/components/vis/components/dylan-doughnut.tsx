// @ts-nocheck

import React, { useEffect, useState } from 'react'
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
    LinearScale
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { months } from './Utils'
import 'chartjs-adapter-moment';
import { Portal } from '@chakra-ui/portal';
import { Center } from '@chakra-ui/layout';
import { Flex, Box } from 'nde-design-system';
import CountUp from 'react-countup';

ChartJS.register(
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale
)



const DylanDoughnutChart = ({ data, updateFilters }) => {

    const doughnutOptions = {
        onClick: (evt, second, myChart) => {
            const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (points.length) {
                const firstPoint = points[0];
                const label = myChart.data.labels[firstPoint.index];
                updateFilters({
                    '@type': [label],
                });
            }
        },
        onHover: (event, chartElement) => {
            const target = event.native ? event.native.target : event.target;
            target.style.cursor = chartElement[0] ? 'pointer' : 'default';
        },
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        legend: {
            fontColor: "white",
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: {
                        size: 20
                    },

                },
                onClick: (e, legend,) => {
                    updateFilters({
                        '@type': [legend['text']],
                    });
                },
                onHover: function (e) {
                    e.native.target.style.cursor = 'pointer';
                },
                onLeave: function (e) {
                    e.native.target.style.cursor = 'default';
                }
            },
            datalabels: {
                display: false,
            },
            tooltip: {
                // padding: 10,
                titleFont: {
                    size: 20
                },
                bodyFont: {
                    size: 20
                },
                footerFont: {
                    size: 20 // there is no footer by default
                },
            }

        }
    }


    const plugins = [
        {
            afterDraw: function (chart) {
                if (chart.data.datasets[0].data.length < 1) {
                    let ctx = chart.ctx;
                    let width = chart.width;
                    let height = chart.height;
                    ctx.textAlign = "center";
                    ctx.fillStyle = 'white';
                    ctx.textBaseline = "middle";
                    ctx.font = "30px Public Sans";
                    ctx.fillText("No data to display", width / 2, height / 2);
                    ctx.restore();
                }
            },
        }
    ];

    return (
        <Center
            width={'100%'}
            height={'100%'}
        // minW={0}
        // minH={0}
        // height={{ xl: '40vh', md: '20vh' }}
        >
            {data['datasets'][0]['data'][0] &&
                <Flex
                    position="absolute"
                    zIndex={1}
                    mt={5}
                    color={'white'}
                    fontSize={{ xl: '28', sm: '28' }}
                    flexDir={'column'}
                >
                    <Center>
                        <CountUp
                            duration={1.6}
                            separator=","
                            end={data['datasets'][0]['data'].reduce((a, b) => a + b, 0)}
                        />
                    </Center>
                    <Center>
                        Total Records
                    </Center>
                </Flex>
            }
            <Center
                width={'100%'}
                height={'100%'}
            >
                <Doughnut
                    data={data}
                    // height={'40vw'}
                    options={doughnutOptions}
                    plugins={plugins}
                />
            </Center>
        </Center >
    )
}
export default DylanDoughnutChart
