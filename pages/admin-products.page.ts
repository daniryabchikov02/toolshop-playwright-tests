import { Locator, Page } from '@playwright/test';

export class AdminProductsPage {
  readonly addProductButton: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly rows: Locator;

  constructor(private page: Page) {
    this.addProductButton = page.getByTestId('product-add');
    this.searchInput = page.getByTestId('product-search-query');
    this.searchButton = page.getByTestId('product-search-submit');
    this.rows = page.locator('table tbody tr');
  }

  async goto() {
    await this.page.goto('/admin/products');
  }

  async search(text: string) {
    await this.searchInput.fill(text);
    await this.searchButton.click();
  }

  row(productId: string): Locator {
    return this.rows.filter({ has: this.page.getByTestId(`product-edit-${productId}`) });
  }

  async edit(productId: string) {
    await this.page.getByTestId(`product-edit-${productId}`).click();
  }

  async delete(productId: string) {
    await this.page.getByTestId(`product-delete-${productId}`).click();
  }
}
