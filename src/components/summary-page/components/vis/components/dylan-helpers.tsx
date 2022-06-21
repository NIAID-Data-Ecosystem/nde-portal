// @ts-nocheck
import moment from 'moment';
import ChartDataLabels from 'chartjs-plugin-datalabels';

function getDataCatalog(responseData) {
    let catalogObj = {}
    for (const funder in responseData) {
        if (responseData['includedInDataCatalog.name'].length > 0) {
            const dateInfo = responseData['includedInDataCatalog.name']
            dateInfo.forEach(obj => {
                // if (catalogObj[obj['term']]) {
                //     catalogObj[obj['term']] += obj['count']
                // } else {
                if (obj['term'] === 'Omics Discovery Index (OmicsDI)') {
                    catalogObj['Omics Discovery Index'] = obj['count']
                } else {
                    catalogObj[obj['term']] = obj['count']
                }
                // }
            });
        }
    }
    // this

    // const sorted = Object.fromEntries(Object.entries(catalogObj).sort((a, b) => b[1] - a[1]))
    // const topResults = Object.fromEntries(
    //     Object.entries(sorted).slice(0, 6)
    // )
    // const other = Object.fromEntries(
    //     Object.entries(sorted).slice(6))
    // let otherTotal = 0
    // Object.entries(other).forEach(key => {
    //     otherTotal += key[1]
    // });
    // topResults['Other'] = otherTotal
    // return topResults

    // or
    return Object.fromEntries(Object.entries(catalogObj).sort((a, b) => b[1] - a[1]))

}

export function createDataCatalogDataset(responseData) {
    const dataCatalog = {
        labels: Object.keys(getDataCatalog(responseData)),
        datasets: [{
            label: 'Catalog Name',
            data: Object.entries(getDataCatalog(responseData)).map(x => x[1]),
            radius: Object.entries(getDataCatalog(responseData)).map(x => x[1] < 3 ? 4 : x[1] * 2),
            backgroundColor: [
                'rgba(54, 57, 105)',
                'rgba(152, 113, 65)',
                'rgba(152, 129, 65)',
                'rgba(45, 77, 97)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(5,0,128, 0.2)',
                'rgba(5,0,255, 0.2)',
                'rgba(5,128,0, 0.2)',
                'rgba(5,128,128, 0.2)',
                'rgba(5,255,255, 0.2)',
                'rgba(5,255,0, 0.2)',
            ],
            borderColor: [
                'rgba(54, 57, 105)',
                'rgba(152, 113, 65)',
                'rgba(152, 129, 65)',
                'rgba(45, 77, 97)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(5,0,128)',
                'rgb(5,0,255)',
                'rgb(5,128,0)',
                'rgb(5,128,128)',
                'rgb(5,255,255)',
                'rgb(5,255,0)',
            ],
            borderWidth: 1,
            maxBarThickness: 40,
        }],
    };
    return dataCatalog
}


function getType(responseData) {

    let catalogObj = {}
    for (const funder in responseData) {
        if (responseData['@type'].length > 0) {
            const dateInfo = responseData['@type']
            dateInfo.forEach(obj => {
                // if (catalogObj[obj['term']]) {
                //     catalogObj[obj['term']] += obj['count']
                // } else {
                //     console.log(obj)
                //     catalogObj[obj['term']] = obj['count']
                // }
                if (obj['term'] === 'ComputationalTool') {
                    catalogObj["Computational Tool"] = obj['count']
                } else {
                    catalogObj[obj['term']] = obj['count']
                }
            });
        }
    }
    return Object.fromEntries(Object.entries(catalogObj).sort((a, b) => b[1] - a[1]))
}

export function createTypeDataset(responseData) {
    const type = {
        labels: Object.keys(getType(responseData)),
        datasets: [{
            label: 'Catalog Name',
            data: Object.entries(getType(responseData)).map(x => x[1]),
            backgroundColor: [
                'rgba(54, 57, 105)',
                'rgba(152, 113, 65)',
                'rgba(152, 129, 65)',
                'rgba(45, 77, 97)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(5,0,128, 0.2)',
                'rgba(5,0,255, 0.2)',
                'rgba(5,128,0, 0.2)',
                'rgba(5,128,128, 0.2)',
                'rgba(5,255,255, 0.2)',
                'rgba(5,255,0, 0.2)',
            ],
            borderColor: [
                'rgb(54, 57, 105)',
                'rgb(152, 113, 65)',
                'rgb(152, 129, 65)',
                'rgb(45, 77, 97)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(5,0,128)',
                'rgb(5,0,255)',
                'rgb(5,128,0)',
                'rgb(5,128,128)',
                'rgb(5,255,255)',
                'rgb(5,255,0)',
            ],
            borderWidth: 1,

        }],
        // funder: funder
    };
    return type
}


function getDate(responseData) {
    let catalogObj = {}
    if (responseData['date'].length > 0) {
        const dateInfo = responseData['date']
        dateInfo.forEach(obj => {
            // if (catalogObj[obj['term']]) {
            //     catalogObj[obj['term']] += obj['count']
            // } else {
            if (!moment(obj['term']).isAfter()) {
                const rounded = moment(obj['term']).startOf('quarter').toISOString()
                catalogObj[rounded] ? catalogObj[rounded] += obj['count'] : catalogObj[rounded] = obj['count']
                // catalogObj[rounded] = obj['count']

            }
            // }
        });
    }
    return Object.fromEntries(Object.entries(catalogObj).sort((a, b) => a[0].localeCompare(b[0])))
    return catalogObj
}

export function createDateDataset(responseData) {
    const date = {
        labels: Object.keys(getDate(responseData)).map(key => key.substring(0, 10)),
        datasets: [{
            // barThickness: 6,
            label: 'Catalog Release Date',
            data: Object.entries(getDate(responseData)).map(x => x[1]),
            // radius: Object.entries(getDate()).map(x => x[1] < 3 ? 4 : x[1] * 2),
            backgroundColor: [
                // 'rgba(255, 99, 132, 0.2)',
                // 'rgba(255, 159, 64, 0.2)',
                // 'rgba(255, 205, 86, 0.2)',
                // 'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235)',
                // 'rgba(153, 102, 255, 0.2)',
                // 'rgba(5,0,128, 0.2)',
                // 'rgba(5,0,255, 0.2)',
                // 'rgba(5,128,0, 0.2)',
                // 'rgba(5,128,128, 0.2)',
                // 'rgba(5,255,255, 0.2)',
                // 'rgba(5,255,0, 0.2)',
            ],
            borderColor: [
                // 'rgb(255, 99, 132)',
                // 'rgb(255, 159, 64)',
                // 'rgb(255, 205, 86)',
                // 'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                // 'rgb(153, 102, 255)',
                // 'rgb(5,0,128)',
                // 'rgb(5,0,255)',
                // 'rgb(5,128,0)',
                // 'rgb(5,128,128)',
                // 'rgb(5,255,255)',
                // 'rgb(5,255,0)',
            ],
            borderWidth: 1,
            maxBarThickness: 30,
        }],

        // funder: funder
    };
    return date
}

export function getMeasurementTechnique(responseData) {
    let result = []
    if (responseData['measurementTechnique.name'].length > 0) {
        const dateInfo = responseData['measurementTechnique.name']
        const sorted = Object.fromEntries(Object.entries(dateInfo).sort((a, b) => b[1]['count'] - a[1]['count']))
        const topResults = Object.fromEntries(
            Object.entries(sorted).filter(entry => entry[1]['term'] !== 'Other').slice(0, 5)
        );
        for (const key in topResults) {
            result.push(topResults[key])
        }
    }
    return result
}

export function getInfectiousAgent(responseData) {
    let result = []
    if (responseData['infectiousAgent.name'].length > 0) {
        const dateInfo = responseData['infectiousAgent.name']
        const sorted = Object.fromEntries(Object.entries(dateInfo).sort((a, b) => b[1]['count'] - a[1]['count']))
        const topResults = Object.fromEntries(
            Object.entries(sorted).slice(0, 5)
        );
        for (const key in topResults) {
            result.push(topResults[key])
        }
    }
    return result
}
