import { Locator, Page } from '@playwright/test';
import { ProductData } from '../data/test-data';

export class ProductFormPage {
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly stockInput: Locator;
  readonly priceInput: Locator;
  readonly brandSelect: Locator;
  readonly categorySelect: Locator;
  readonly imageSelect: Locator;
  readonly saveButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.nameInput = page.getByTestId('name');
    this.descriptionInput = page.getByTestId('description');
    this.stockInput = page.getByTestId('stock');
    this.priceInput = page.getByTestId('price');
    this.brandSelect = page.getByTestId('brand-id');
    this.categorySelect = page.getByTestId('category-id');
    this.imageSelect = page.getByTestId('product-image-id');
    this.saveButton = page.getByTestId('product-submit');
    this.successMessage = page.getByRole('alert').filter({ hasText: 'Product saved!' });
  }

  async fill(product: ProductData) {
    await this.nameInput.fill(product.name);
    await this.descriptionInput.fill(product.description);
    await this.stockInput.fill(String(product.stock));
    await this.priceInput.fill(String(product.price));
    await this.brandSelect.selectOption({ label: product.brand });
    await this.categorySelect.selectOption({ label: product.category });
    await this.imageSelect.selectOption({ index: 1 });
  }

  async save() {
    await this.saveButton.click();
  }
}
