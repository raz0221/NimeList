const ANILIST_API_URL = 'https://graphql.anilist.co';

export const fetchAniList = async (query: string, variables: Record<string, any> = {}) => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await response.json();
    
    if (json.errors) {
      throw new Error(json.errors[0].message);
    }
    
    return json.data;
  } catch (error) {
    console.error('AniList API Error:', error);
    throw error;
  }
};
