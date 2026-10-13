import { test, expect } from '../fixtures';
import { users } from '../data/users';
import { newProduct, ProductData, uniqueName } from '../data/test-data';
import { NamedItem } from '../api/toolshop-api';
import { AdminProductsPage } from '../pages/admin-products.page';
import { ProductFormPage } from '../pages/product-form.page';
import { StorefrontPage } from '../pages/storefront.page';

test.describe.serial('Admin product CRUD', () => {
  let brand: NamedItem;
  let category: NamedItem;
  let product: ProductData;
  let updatedProduct: ProductData;
  let productId: string;

  test.beforeAll(async ({ adminApi }) => {
    brand = await adminApi.createBrand(uniqueName('Brand'));
    category = await adminApi.createCategory(uniqueName('Category'));
    product = newProduct(brand.name, category.name);
    updatedProduct = { ...product, name: uniqueName('Mallet'), price: 24.5 };
  });

  test.beforeEach(async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.admin.email, users.admin.password);
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
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

  test('create a product', async ({ adminProductsPage, productFormPage, adminApi }) => {
    await adminProductsPage.goto();
    await adminProductsPage.addProductButton.click();
    await productFormPage.fill(product);
    await productFormPage.save();

    await expect(productFormPage.successMessage).toBeVisible();

    const found = await adminApi.searchProducts(product.name);
    expect(found).toHaveLength(1);
    productId = found[0].id;
  });

  test('read the product in admin and storefront', async ({ adminProductsPage, productFormPage, storefrontPage }) => {
    await expectProductInAdmin(adminProductsPage, productFormPage, productId, product);
    await expectProductInStorefront(storefrontPage, productId, product);
  });

  test('update the product name and price', async ({ adminProductsPage, productFormPage, storefrontPage }) => {
    await adminProductsPage.goto();
    await adminProductsPage.search(product.name);
    await adminProductsPage.edit(productId);
    await expect(productFormPage.nameInput).toHaveValue(product.name);

    // The edit form does not load the saved brand, category, image and stock
    await productFormPage.fill(updatedProduct);
    await productFormPage.save();
    await expect(productFormPage.successMessage).toBeVisible();

    await expectProductInAdmin(adminProductsPage, productFormPage, productId, updatedProduct);
    await expectProductInStorefront(storefrontPage, productId, updatedProduct);
  });

  test('delete the product', async ({ page, adminProductsPage, storefrontPage, adminApi }) => {
    await adminProductsPage.goto();
    await adminProductsPage.search(updatedProduct.name);
    await expect(adminProductsPage.row(productId)).toBeVisible();

    await adminProductsPage.delete(productId);
    await expect(page.getByText('Product deleted.')).toBeVisible();

    await adminProductsPage.search(updatedProduct.name);
    await expect(adminProductsPage.rows).toHaveCount(0);

    await storefrontPage.goto();
    await storefrontPage.search(updatedProduct.name);
    await expect(storefrontPage.noResults).toBeVisible();
    await expect(storefrontPage.productCard(productId)).toBeHidden();

    const response = await adminApi.getProduct(productId);
    expect(response.status()).toBe(404);
  });
});

async function expectProductInAdmin(
  adminProductsPage: AdminProductsPage,
  productFormPage: ProductFormPage,
  productId: string,
  product: ProductData,
) {
  await adminProductsPage.goto();
  await adminProductsPage.search(product.name);
  await expect(adminProductsPage.rows).toHaveCount(1);
  await expect(adminProductsPage.row(productId).getByRole('cell')).toHaveText([
    productId,
    product.name,
    String(product.stock),
    `$${product.price.toFixed(2)}`,
    /Edit/,
  ]);

  await adminProductsPage.edit(productId);
  await expect(productFormPage.nameInput).toHaveValue(product.name);
  await expect(productFormPage.descriptionInput).toHaveValue(product.description);
  await expect(productFormPage.priceInput).toHaveValue(String(product.price));
}

async function expectProductInStorefront(storefrontPage: StorefrontPage, productId: string, product: ProductData) {
  await storefrontPage.goto();
  await storefrontPage.search(product.name);
  const card = storefrontPage.productCard(productId);
  await expect(card).toContainText(product.name);
  await expect(card).toContainText(`$${product.price.toFixed(2)}`);

  await storefrontPage.openProduct(productId);
  await expect(storefrontPage.productName).toHaveText(product.name);
  await expect(storefrontPage.productPrice).toHaveText(product.price.toFixed(2));
  await expect(storefrontPage.productDescription).toHaveText(product.description);
  await expect(storefrontPage.productCategory).toHaveText(product.category);
  await expect(storefrontPage.productBrand).toHaveText(product.brand);
}
