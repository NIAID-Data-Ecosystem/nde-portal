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
    const {
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
                        size: 14
                    }
                }
            },
            x: {
                ticks: {
                    autoSkip: true,
                    color: 'white',
                    font: {
                        size: 14
                    }
                },
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: {
                        size: 18
                    },
                },
                onClick: (e) => e

            },
            datalabels: {
                display: true,
                color: "white",
                formatter: function (value) {
                    return value.toLocaleString("en-US")
                },
                anchor: "end",
                align: "end",
                font: {
                    size: 14
                }
            }
        },
        layout: {
            padding: {
                left: 0,
                right: 50,
                top: 0,
                bottom: 0
            }
        }

    }

    const dateOptions = {
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
                    tooltipFormat: 'MM.DD.YYYY',
                    unit: 'quarter',
                    round: 'quarter'
                },
                ticks: {
                    color: 'white',
                    font: {
                        size: 14
                    },
                },
            },
            y: {
                beginAtZero: true,
                suggestedMin: 0,
                suggestedMax: 5,
                ticks: {
                    color: 'white',
                    font: {
                        size: 14
                    }
                },
            },
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
        },
    }

    return (
        <Box>
            {responseData &&
                <Flex
                    // maxH={{ xl: 550, md: 'fit-content' }}
                    // h={{ xl: 550, md: 'fit-content' }}
                    direction={{ xl: 'row', base: 'column' }}
                    p={6}
                    alignItems={'center'}
                    bg='tertiary.800'
                    overflow={'hidden'}
                >
                    <Box
                        width={'100%'}
                        minH={0}
                        height={{ xl: '25vh', base: '20vh' }}
                        minW={0}
                        order={{ xl: 1, base: 2 }}
                    >
                        <DylanBarChart
                            data={createDataCatalogDataset(responseData)}
                            options={options}
                        />
                    </Box>
                    <Box
                        width={'100%'}
                        minW={0}
                        minH={0}
                        height={{ xl: '35vh', base: '30vh' }}
                        order={{ xl: 2, base: 1 }}
                    >
                        <DylanDoughnutChart
                            data={createTypeDataset(responseData)}
                        />

                    </Box>
                    <Box
                        width={'100%'}
                        minW={0}
                        minH={0}
                        height={{ xl: '25vh', base: '20vh' }}
                        order={{ xl: 3, base: 2 }}
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
