import { test, expect } from '../fixtures';
import { users } from '../data/users';
import { newProduct, ProductData, uniqueName } from '../data/test-data';
import { NamedItem } from '../api/toolshop-api';

test.describe('Product form validation', () => {
  let brand: NamedItem;
  let category: NamedItem;
  let product: ProductData;

  test.beforeAll(async ({ adminApi }) => {
    brand = await adminApi.createBrand(uniqueName('Brand'));
    category = await adminApi.createCategory(uniqueName('Category'));
  });

  test.beforeEach(async ({ page, loginPage, adminProductsPage }) => {
    product = newProduct(brand.name, category.name);
    await loginPage.goto();
    await loginPage.login(users.admin.email, users.admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await adminProductsPage.goto();
    await adminProductsPage.addProductButton.click();
  });

  test.afterAll(async ({ adminApi }) => {
    if (brand) {
      await adminApi.deleteProductsOfBrand(brand.id);
      await adminApi.deleteBrand(brand.id);
    }
    if (category) {
      await adminApi.deleteCategory(category.id);
    }
  });

  test('product is not saved without a name', async ({ page, productFormPage, adminApi }) => {
    await productFormPage.fill({ ...product, name: '' });
    await productFormPage.save();

    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(productFormPage.successMessage).toBeHidden();
    expect(await adminApi.productsOfBrand(brand.id)).toHaveLength(0);
  });

  test('product is not saved with a price that is not a number', async ({ page, productFormPage, adminApi }) => {
    await productFormPage.fill(product);
    await productFormPage.priceInput.fill('abc');
    await productFormPage.save();

    await expect(page.getByText('The price field must be a number.')).toBeVisible();
    await expect(productFormPage.successMessage).toBeHidden();
    expect(await adminApi.productsOfBrand(brand.id)).toHaveLength(0);
  });
});
