export const searchCriteria = {
  country: 'México',
  searchTerm: 'playstation 5',
  condition: 'Nuevo',
  locationOptions: ['Ciudad de México', 'Ciudad De México', 'CDMX', 'Distrito Federal'],
  sortBy: 'price_asc',
  resultsToExtract: 5,
  minimumApiMatches: 3,
};

export const environmentConfig = {
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.mercadolibre.com',
  siteId: process.env.SITE_ID || 'MLM',
};
