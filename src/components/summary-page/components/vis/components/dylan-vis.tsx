// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Chart as ChartJS, BarElement, LinearScale, CategoryScale, TimeScale } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { months } from './Utils'
import { SelectedFilterType } from 'src/components/summary-page';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { useQuery } from 'react-query';
import { queryFilterObject2String } from 'src/components/filter';
import { fetchSearchResults } from 'src/utils/api';
import LoadingSpinner from 'src/components/loading';
import { Error } from 'src/components/error';
import { useRouter } from 'next/router';
import { createDataCatalogDataset, createDateDataset, createTypeDataset } from 'src/components/summary-page/components/vis/components/dylan-helpers';
import DylanBarChart from './dylan-bar';
import DylanDoughnutChart from './dylan-doughnut'
import { enUS } from 'date-fns/locale';
import 'chartjs-adapter-moment';
import { Box, Center, Flex } from 'nde-design-system';
import { ChartTemplate } from './chart-template';
import moment from 'moment';




ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    TimeScale
)


const DylanVis = ({ queryString, filters, updateFilters }) => {
    const router = useRouter();

    // All the facets that you need.
    const facets = [
        'includedInDataCatalog.name',
        'infectiousAgent.name',
        '@type',
        'dateModified',
        'infectiousDisease.name',
        'measurementTechnique.name',
        'date',
        'funding.funder.name',
    ];


    // This query function is interchangeable for both queries we have below.
    const queryFn = (queryString: string, filters?: {}) => {
        if (typeof queryString !== 'string' && !queryString) {
            return;
        }
        const filter_string = filters ? queryFilterObject2String(filters) : null;

        return fetchSearchResults({
            q: filter_string
                ? `${queryString === '__all__' ? '' : `${queryString} AND `
                }${filter_string}`
                : `${queryString}`,
            facet_size: 1000,
            facets: facets.join(','),
        });
    };



    /*
    Get Grant names. We might extract this query to "pages/summary.tsx" and just get all the facets we need that are unchanging in one spot. I use a similar query for Filters and will probably need the same for my viz.
    */
    const {
        data: grantNames,
        isLoading: grantNamesIsLoading,
        error: grantNamesError,
    } = useQuery<FetchSearchResultsResponse | undefined, Error>(
        [
            'search-results',
            {
                q: queryString,
                facets,
            },
        ],
        () => queryFn(queryString),
        {
            refetchOnWindowFocus: false,
            select: d => {
                // This is where we can transform the data received and shape it.
                const grants = d?.facets?.['funding.funder.name'].terms;
                if (grants) {
                    return grants;
                }
                return [];
            },
        },
    );

    /*
    Get all the data you wanted.
    */
    let {
        data: responseData,
        isLoading: responseDataIsLoading,
        error: responseDataError,
    } = useQuery<FetchSearchResultsResponse | undefined, Error>(
        [
            'search-results',
            {
                q: queryString,
                // note that [filters] is now a dependency
                filters,
                facets,
            },
        ],
        // note that [filters] is now added to the query function.
        () => queryFn(queryString, filters),
        {
            refetchOnWindowFocus: false,
            select: d => {
                // This is where we can transform the data received and shape it.
                return {
                    ...d,
                    total: d['total'],
                    '@type': d['facets']['@type']['terms'],
                    dateModified: d['facets']['dateModified']['terms'],
                    'includedInDataCatalog.name':
                        d['facets']['includedInDataCatalog.name']['terms'],
                    'infectiousAgent.name': d['facets']['infectiousAgent.name']['terms'],
                    'infectiousDisease.name':
                        d['facets']['infectiousDisease.name']['terms'],
                    'measurementTechnique.name':
                        d['facets']['measurementTechnique.name']['terms'],
                    date: d['facets']['date']['terms'],
                };
            },
        },
    );

    const options = {
        onClick: (evt, second, myChart) => {
            const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (points.length) {
                const firstPoint = points[0];
                const label = myChart.data.labels[firstPoint.index];
                if (label === 'Other') {
                    updateFilters({
                        'includedInDataCatalog.name': myChart['data']['datasets'][0]['otherNames'],
                    });
                } else if (label === 'Omics Discovery Index') {
                    updateFilters({
                        'includedInDataCatalog.name': ["Omics Discovery Index (OmicsDI)"],
                    });
                } else {
                    updateFilters({
                        'includedInDataCatalog.name': [label],
                    });
                }
            }
        },
        onHover: (event, activeElements) => {
            if (activeElements?.length > 0) {
                event.native.target.style.cursor = 'pointer';
            } else {
                event.native.target.style.cursor = 'auto';
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 5,
                ticks: {
                    autoSkip: true,
                    color: 'white',
                    font: {
                        size: 16
                    }
                }
            },
            x: {
                ticks: {
                    autoSkip: true,
                    // autoSkip: true,
                    maxTicksLimit: 10,
                    color: 'white',
                    font: {
                        size: 16
                    },
                },
            }
        },
        plugins: {
            legend: {
                maxHeight: 200,
                labels: {
                    // padding: 20,
                    color: 'white',
                    font: {
                        size: 20
                    },
                },
                onClick: (e) => e

            },
            datalabels: {
                display: true,
                color: "white",
                formatter: function (value, chart) {
                    return value?.toLocaleString("en-US")
                },
                anchor: "end",
                align: function (chart) {
                    if (chart['dataIndex'] > 0) {
                        return 'end'
                    } else {
                        return 'start'
                    }
                },
                font: {
                    size: 18,
                    // weight:  'bold',
                },
                padding: 2
            },
            tooltip: {
                displayColors: function (chart) {
                    if (chart['tooltip']['title'][0] === 'Other') {
                        return false
                    } else {
                        return true
                    }
                },
                titleFont: {
                    size: 20
                },
                bodyFont: {
                    size: 20
                },
                footerFont: {
                    size: 20 // there is no footer by default
                },
                callbacks: {
                    label: function (chart) {
                        if (chart['label'] === 'Other') {
                            return chart['dataset']['otherNames']
                        } else {
                            return chart['formattedValue']
                        }
                    }
                }
            }
        },
        layout: {
            padding: {
                // left: 60,
                // right: 60,
                top: 0,
                bottom: 0
            }
        },


    }

    const dateOptions = {
        onClick: (evt, second, myChart) => {
            const points = myChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (points.length) {
                const firstPoint = points[0];
                const label = myChart.data.labels[firstPoint.index];
                let fromDate = moment(label)
                let toDate = moment(label).add(1, 'quarters');
                let diff = toDate.diff(fromDate, 'day')
                let range = []
                for (let i = 1; i < diff; i++) {
                    range.push(moment(label).add(i, 'day').format("YYYY-MM-DD"))
                }
                updateFilters({
                    // 'date': ['["2022-04-27" TO "2022-04-27"]'],
                    'date': range
                });
            }
        },
        onHover: (event, activeElements) => {
            if (activeElements?.length > 0) {
                event.native.target.style.cursor = 'pointer';
            } else {
                event.native.target.style.cursor = 'auto';
            }
        },

        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'time',
                adapters: {
                    date: {
                        locale: enUS
                    }
                },
                time: {
                    tooltipFormat: '[Q]Q - YYYY',
                    unit: 'quarter',
                    round: 'quarter'
                },
                ticks: {
                    color: 'white',
                    font: {
                        size: 16
                    },
                    autoSkip: true,
                    maxRotation: 25,
                },
            },
            y: {
                beginAtZero: true,
                suggestedMin: 0,
                suggestedMax: 5,
                ticks: {
                    color: 'white',
                    font: {
                        size: 16
                    }
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: {
                        size: 20
                    }
                },
                onClick: (e) => e

            },
            datalabels: {
                display: false,
            },
            tooltip: {
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

        },
    }


    return (
        <Box>
            {responseData &&
                <Flex
                    // maxH={{ xl: 550, md: 'fit-content' }}
                    // h={{ xl: 550, md: 'fit-content' }}
                    direction={{ xl: 'row', base: 'column' }}
                    justifyContent={'space-between'}
                    p={6}
                    alignItems={'center'}
                    bg='tertiary.800'
                    overflow={'hidden'}
                    minW={536}
                    minH={200}
                // maxH={525}
                >
                    <Box
                        width={'100%'}
                        minH={0}
                        // height={{ xl: '30vh', base: '20vh' }}
                        height={300}
                        minW={0}
                        order={{ xl: 1, base: 2 }}
                        my={10}
                    >
                        <DylanBarChart
                            data={createDataCatalogDataset(responseData)}
                            options={options}
                        />
                    </Box>
                    <Box
                        width={'100%'}
                        // m={6}
                        minW={0}
                        minH={0}
                        height={400}

                        // height={{ xl: '35vh', base: '30vh' }}
                        order={{ xl: 2, base: 1 }}
                        my={{ xl: 0, base: 5 }}
                    >
                        <DylanDoughnutChart
                            data={createTypeDataset(responseData)}
                            updateFilters={updateFilters}
                        />

                    </Box>
                    <Box
                        width={'100%'}
                        minW={0}
                        minH={0}
                        height={300}

                        // height={{ xl: '30vh', base: '20vh' }}
                        order={{ xl: 3, base: 2 }}
                        my={10}
                    >
                        <DylanBarChart
                            data={createDateDataset(responseData)}
                            options={dateOptions}
                        />
                    </Box>
                </Flex>
            }
        </Box >
    )
}
export default DylanVis
