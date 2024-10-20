import { AppConfig } from "../config/config";

export async function callHashnodeAPI(query: string, variables: Record<string, any>) {
    const url = 'https://api.hashnode.com/';

    const requestBody = {
        query,
        variables,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AppConfig.hashnodeToken
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            // Handle HTTP errors
            const errorDetails = await response.json();
            throw new Error(`Error: ${response.status} ${errorDetails.message || errorDetails}`);
        }

        const data = await response.json();
        return data.data; // Return the data part of the response

    } catch (error) {
        console.error('Error calling Hashnode API:', error);
        throw error; // Rethrow the error for further handling if needed
    }
}
