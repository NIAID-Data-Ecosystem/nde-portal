import moment from 'moment';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { theme } from 'nde-design-system';
import { ResponseDataProps } from './dylan-vis';

function getDataCatalog(responseData: ResponseDataProps) {
  let catalogObj = {} as { [key: string]: number };
  for (const funder in responseData) {
    if (responseData['includedInDataCatalog.name'].length > 0) {
      const dateInfo = responseData['includedInDataCatalog.name'];
      dateInfo.forEach(obj => {
        if (obj['term'] === 'Omics Discovery Index (OmicsDI)') {
          catalogObj['Omics Discovery Index'] = obj['count'];
        } else {
          catalogObj[obj['term']] = obj['count'];
        }
      });
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(catalogObj).sort((a, b) => b[1] - a[1]),
  );
  const topResults: {
    [k: string]: number | { names: string[]; total: number };
  } = Object.fromEntries(Object.entries(sorted).slice(0, 6));

  const other = Object.fromEntries(Object.entries(sorted).slice(6));
  let otherTotal = 0;
  let otherNames: string[] = [];
  Object.entries(other).forEach(key => {
    otherTotal += key[1];
    otherNames.push(key[0]);
  });
  if (otherNames.length) {
    topResults['Other'] = { total: otherTotal, names: otherNames };
  }
  return topResults;
}

export function createDataCatalogDataset(responseData: ResponseDataProps) {
  const dataCatalogResponse = getDataCatalog(responseData);

  const otherNames =
    dataCatalogResponse['Other'] &&
    typeof dataCatalogResponse['Other'] !== 'number'
      ? dataCatalogResponse['Other'].names
      : [];

  return {
    labels: Object.keys(dataCatalogResponse),
    datasets: [
      {
        label: 'Catalog Name',
        data: Object.entries(dataCatalogResponse).map(x =>
          typeof x[1] === 'number' ? x[1] : x[1]['total'],
        ),
        radius: Object.entries(dataCatalogResponse).map(x => {
          let total = typeof x[1] === 'number' ? x[1] : x[1]['total'];
          return total < 3 ? 4 : total * 2;
        }),
        otherNames,
        backgroundColor: schemeTableau10,
        borderWidth: 1,
        maxBarThickness: 40,
        minBarLength: 5,
      },
    ],
  };
}

function getType(responseData: ResponseDataProps) {
  let catalogObj = {} as { [key: string]: number };
  for (const funder in responseData) {
    if (responseData['@type'].length > 0) {
      const dateInfo = responseData['@type'];
      dateInfo.forEach(obj => {
        if (obj['term'] === 'ComputationalTool') {
          catalogObj['Computational Tool'] = obj['count'];
        } else {
          catalogObj[obj['term']] = obj['count'];
        }
      });
    }
  }
  return Object.fromEntries(
    Object.entries(catalogObj).sort((a, b) => b[1] - a[1]),
  );
}

export function createTypeDataset(responseData: ResponseDataProps) {
  const teal = theme.colors.primary['500'];
  const pink = theme.colors.accent.bg;
  const type = {
    labels: Object.keys(getType(responseData)),
    datasets: [
      {
        label: 'Catalog Name',
        data: Object.entries(getType(responseData)).map(x => x[1]),
        backgroundColor: [
          teal,
          pink,
          'rgb(152, 129, 65)',
          'rgb(45, 77, 97)',
          'rgb(54, 162, 235, 0.2)',
          'rgb(153, 102, 255, 0.2)',
          'rgb(5,0,128, 0.2)',
          'rgb(5,0,255, 0.2)',
          'rgb(5,128,0, 0.2)',
          'rgb(5,128,128, 0.2)',
          'rgb(5,255,255, 0.2)',
          'rgb(5,255,0, 0.2)',
        ],
        borderColor: [
          teal,
          pink,
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
      },
    ],
    // funder: funder
  };
  return type;
}

function getDate(responseData: ResponseDataProps) {
  let catalogObj = {} as { [key: string]: number };
  if (responseData['date'].length > 0) {
    const dateInfo = responseData['date'];
    dateInfo.forEach(obj => {
      // if (catalogObj[obj['term']]) {
      //     catalogObj[obj['term']] += obj['count']
      // } else {
      if (!moment(obj['term']).isAfter()) {
        const rounded = moment(obj['term']).startOf('quarter').toISOString();
        catalogObj[rounded]
          ? (catalogObj[rounded] += obj['count'])
          : (catalogObj[rounded] = obj['count']);
        // catalogObj[rounded] = obj['count']
      }
      // }
    });
  }
  return Object.fromEntries(
    Object.entries(catalogObj).sort((a, b) => a[0].localeCompare(b[0])),
  );
}

export function createDateDataset(responseData: ResponseDataProps) {
  const grey = theme.colors.gray['500'];
  const date = {
    labels: Object.keys(getDate(responseData)).map(key => key.substring(0, 10)),
    datasets: [
      {
        label: 'Resource Release Date',
        data: Object.entries(getDate(responseData)).map(x => x[1]),
        backgroundColor: [grey],
        borderColor: [grey],
        borderWidth: 1,
        maxBarThickness: 30,
      },
    ],
  };
  return date;
}

export function getMeasurementTechnique(responseData: ResponseDataProps) {
  let result = [];
  if (responseData['measurementTechnique.name'].length > 0) {
    const dateInfo = responseData['measurementTechnique.name'];
    const sorted = Object.fromEntries(
      Object.entries(dateInfo).sort((a, b) => b[1]['count'] - a[1]['count']),
    );
    const topResults = Object.fromEntries(
      Object.entries(sorted)
        .filter(entry => entry[1]['term'] !== 'Other')
        .slice(0, 5),
    );
    for (const key in topResults) {
      result.push(topResults[key]);
    }
  }
  return result;
}

export function getInfectiousAgent(responseData: ResponseDataProps) {
  let result = [];
  if (responseData['infectiousAgent.name'].length > 0) {
    const dateInfo = responseData['infectiousAgent.name'];
    const sorted = Object.fromEntries(
      Object.entries(dateInfo).sort((a, b) => b[1]['count'] - a[1]['count']),
    );
    const topResults = Object.fromEntries(Object.entries(sorted).slice(0, 5));
    for (const key in topResults) {
      result.push(topResults[key]);
    }
  }
  return result;
}
