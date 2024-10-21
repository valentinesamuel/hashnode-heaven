import { AppConfig } from '../config/config';

export async function callHashnodeAPI(
  query: string,
  input: Record<string, any>,
) {
  const url = 'https://gql.hashnode.com/';

  const requestBody = {
    query,
    variables: {
      input,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: AppConfig.hashnodeToken,
      },
      body: JSON.stringify(requestBody),
    });


    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Hashnode API:', error);
    throw error; // Rethrow the error for further handling if needed
  }
}
