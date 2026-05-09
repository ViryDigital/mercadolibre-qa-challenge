import { expect, test } from '@playwright/test';
import { searchCriteria } from '../data/search-criteria';
import { HomePage } from '../pages/home.page';
import { SearchResultsPage } from '../pages/search-results.page';
import { MercadoLibreApiService } from '../services/mercado-libre-api.service';
import { compareProducts, countMatches, getDiscrepancies } from '../utils/product-comparator';

test.describe('Búsqueda E2E en MercadoLibre con validación de API', () => {
  test('debe buscar productos, extraer los primeros resultados y validarlos contra la API', async ({
    page,
    request,
  }) => {
    const homePage = new HomePage(page);
    const searchResultsPage = new SearchResultsPage(page);
    const mercadoLibreApiService = new MercadoLibreApiService(request);

    await test.step('Abrir MercadoLibre y seleccionar Mexico', async () => {
      await homePage.open();
      await homePage.selectMexicoCountry();
    });

    await test.step('Buscar producto desde la UI', async () => {
      await homePage.searchProduct(searchCriteria.searchTerm);
      await searchResultsPage.waitForResults();
    });

    await test.step('Aplicar filtros requeridos y ordenamiento', async () => {
      await searchResultsPage.filterByCondition(searchCriteria.condition);
      await searchResultsPage.filterByLocation(searchCriteria.locationOptions);
      await searchResultsPage.sortByLowestPrice();
    });

    const uiProducts = await test.step('Extraer primeros productos desde la UI', async () => {
      const products = await searchResultsPage.getFirstProducts(searchCriteria.resultsToExtract);

      console.log('Productos obtenidos desde la UI:');
      console.table(products);

      return products;
    });

    const apiProducts = await test.step('Obtener productos desde la API', async () => {
      const products = await mercadoLibreApiService.searchProducts(searchCriteria.searchTerm);

      console.log(`Productos devueltos por la API: ${products.length}`);

      return products;
    });

    await test.step('Comparar productos de UI contra productos de API', async () => {
      const matches = compareProducts(uiProducts, apiProducts);
      const totalMatches = countMatches(matches);
      const discrepancies = getDiscrepancies(matches);

      console.log('Coincidencias UI vs API:');
      console.table(matches);

      if (discrepancies.length > 0) {
        console.log('Discrepancias encontradas:');
        console.table(discrepancies);
      }

      expect(
        totalMatches,
        `Se esperaba que al menos ${searchCriteria.minimumApiMatches} productos de UI aparecieran en los resultados de API`
      ).toBeGreaterThanOrEqual(searchCriteria.minimumApiMatches);
    });
  });
});
