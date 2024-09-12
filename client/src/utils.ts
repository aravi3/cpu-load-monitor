// Function for making HTTP requests and logging any errors
export async function fetchData(url: string) {
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`HTTP Error, Status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
    }
}