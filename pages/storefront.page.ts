import { Locator, Page } from '@playwright/test';

export class StorefrontPage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly noResults: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly productDescription: Locator;
  readonly productCategory: Locator;
  readonly productBrand: Locator;

  constructor(private page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchButton = page.getByTestId('search-submit');
    this.noResults = page.getByTestId('no-results');
    this.productName = page.getByTestId('product-name');
    this.productPrice = page.getByTestId('unit-price');
    this.productDescription = page.getByTestId('product-description');
    this.productCategory = page.getByLabel('category', { exact: true });
    this.productBrand = page.getByLabel('brand', { exact: true });
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(text: string) {
    await this.searchInput.fill(text);
    await this.searchButton.click();
  }

  productCard(productId: string): Locator {
    return this.page.getByTestId(`product-${productId}`);
  }

  async openProduct(productId: string) {
    await this.productCard(productId).click();
  }
}
