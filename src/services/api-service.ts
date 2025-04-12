
/**
 * Represents the structure of data returned from an API endpoint.
 */
export interface ApiData {
  id: number;
  name: string;
  value: number;
  category?: string;
  description?: string;
}

/**
 * Fetches data from the specified API endpoint.
 *
 * @param endpoint The URL of the API endpoint to fetch data from.
 * @returns A promise that resolves to an array of ApiData objects.
 */
export async function fetchData(endpoint: string): Promise<ApiData[]> {
  // TODO: Implement this function by calling an external API.

  // Stubbed data for demonstration purposes.
  return [
    {
      id: 1,
      name: 'Example Data 1',
      value: 100,
      category: 'A',
      description: 'This is example data 1',
    },
    {
      id: 2,
      name: 'Example Data 2',
      value: 200,
      category: 'B',
      description: 'This is example data 2',
    },
      {
        id: 3,
        name: 'Example Data 3',
        value: 300,
        category: 'A',
        description: 'This is example data 3',
      },
  ];
}
