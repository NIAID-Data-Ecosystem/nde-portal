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



const DylanDoughnutChart = ({ data }) => {

    const options = {
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
                        size: 18
                    }
                },
                onClick: (e) => e
            },
            datalabels: {
                display: false,
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
                <Center
                    position="absolute"
                    zIndex={1}
                    mt={5}
                    color={'white'}
                    fontSize={{ xl: 24, md: 20 }}
                >
                    <CountUp
                        separator=","
                        end={data['datasets'][0]['data'].reduce((a, b) => a + b, 0)}
                        suffix={' Total Records'}
                    />
                </Center>
            }
            <Center
                width={'100%'}
                height={'100%'}
            >
                <Doughnut
                    data={data}
                    // height={'40vw'}
                    options={options}
                    plugins={plugins}
                />
            </Center>
        </Center >
    )
}
export default DylanDoughnutChart
