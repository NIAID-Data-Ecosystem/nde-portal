const fs = require('fs');
const path = require('path');

// Path to your JSON file
const JSON_FILE_PATH = './configs/schema-definitions.json';
// Path for the output CSV file
const CSV_FILE_PATH = './configs/schema-definitions.csv';

// Function to convert JSON to CSV
function jsonToCsv(json: any) {
  const csvRows = [];
  const headers = Object.keys(json[0]);
  csvRows.push(headers.join(',')); // Add header row

  for (const row of json) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"'); // Escape double quotes
      return `"${escaped}"`; // Quote each value to handle commas in values
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Read JSON file and convert to CSV
fs.readFile(JSON_FILE_PATH, 'utf8', (err: any, data: any) => {
  if (err) {
    console.error('Error reading the JSON file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);

    const csvData = jsonToCsv(Object.values(jsonData));
    fs.writeFile(CSV_FILE_PATH, csvData, (err: any) => {
      if (err) {
        console.error('Error writing the CSV file:', err);
        return;
      }
      console.log('CSV file has been created successfully.');
    });
  } catch (err) {
    console.error('Error parsing JSON data:', err);
  }
});
