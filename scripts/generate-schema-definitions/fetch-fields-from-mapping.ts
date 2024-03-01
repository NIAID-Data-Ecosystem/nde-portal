import axios from 'axios';

export interface MappedFields {
  dotfield: string;
  property: string;
  type: string;
}

// Fetch fields from the API and format them.
export const fetchFieldsFromMapping = async (): Promise<MappedFields[]> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/metadata/fields`,
    );
    console.log(process.env.NEXT_PUBLIC_API_URL);
    if (response.status !== 200) {
      throw new Error(
        'Failed to fetch fields: Server responded with a non-200 status code',
      );
    }
    const fields = Object.keys(response.data).map(key => ({
      dotfield: key,
      property: key.split('.').pop() || key,
      type: response.data[key].type,
    }));
    return fields;
  } catch (error: any) {
    console.error('Error fetching fields from mapping:', error.message);
    throw error;
  }
};

export interface MappedFieldsWithCounts extends MappedFields {
  count: number;
}
// Fetch counts for each field.
export const fetchFieldCounts = async (fields: MappedFields[]) => {
  const results = [];
  for (let i = 0; i < fields.length; i++) {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/query?&q=_exists_:${fields[i].dotfield}&size=0`,
      );
      if (response.status !== 200) {
        throw new Error(
          'Failed to fetch field counts: Server responded with a non-200 status code',
        );
      }
      let count = response.data.total;
      results.push({ ...fields[i], count });
    } catch (error: any) {
      console.error(
        `Error fetching counts for field ${fields[i].dotfield}:`,
        error.message,
      );
    }
  }
  return results;
};
