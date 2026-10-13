import { test, expect } from '../fixtures';
import { newProduct, uniqueName } from '../data/test-data';
import { NamedItem } from '../api/toolshop-api';

test.describe('Products API', () => {
  let brand: NamedItem;
  let category: NamedItem;

  test.beforeAll(async ({ adminApi }) => {
    brand = await adminApi.createBrand(uniqueName('Brand'));
    category = await adminApi.createCategory(uniqueName('Category'));
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

  test('create, read, update and delete a product', async ({ adminApi }) => {
    const product = newProduct(brand.name, category.name);
    const changes = { name: uniqueName('Mallet'), price: 24.5 };
    let productId = '';

    await test.step('create', async () => {
      const response = await adminApi.createProduct(product, brand.id, category.id);
      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body).toMatchObject({
        name: product.name,
        description: product.description,
        price: product.price,
        brand: { id: brand.id, name: brand.name },
        category: { id: category.id, name: category.name },
      });
      productId = body.id;
    });

    await test.step('read', async () => {
      const response = await adminApi.getProduct(productId);
      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({
        id: productId,
        name: product.name,
        description: product.description,
        price: product.price,
        brand: { id: brand.id, name: brand.name },
        category: { id: category.id, name: category.name },
      });

      const found = await adminApi.searchProducts(product.name);
      expect(found.map((item) => item.id)).toEqual([productId]);
    });

    await test.step('update', async () => {
      const response = await adminApi.updateProduct(productId, changes);
      expect(response.status()).toBe(200);

      const updated = await (await adminApi.getProduct(productId)).json();
      expect(updated).toMatchObject({ id: productId, ...changes, description: product.description });
    });

    await test.step('delete', async () => {
      const response = await adminApi.deleteProduct(productId);
      expect(response.status()).toBe(204);

      expect((await adminApi.getProduct(productId)).status()).toBe(404);
      expect(await adminApi.searchProducts(changes.name)).toHaveLength(0);
    });
  });
});
