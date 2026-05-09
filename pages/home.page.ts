import { expect, Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async selectMexicoCountry(): Promise<void> {
    if (this.page.url().includes('mercadolibre.com.mx')) {
      return;
    }

    const mexicoCountryLink = this.page.getByRole('link', { name: /México|Mexico/i }).first();

    await expect(mexicoCountryLink).toBeVisible();
    await mexicoCountryLink.click();

    await expect(this.page).toHaveURL(/mercadolibre\.com\.mx/);
  }

  async searchProduct(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator('input[name="as_word"]');

    await expect(searchInput).toBeVisible();
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');

    await expect(this.page).toHaveURL(/playstation|search|listado/i);
  }
}
