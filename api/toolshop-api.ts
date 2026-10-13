import { APIRequestContext, expect } from '@playwright/test';
import { ProductData, UserData, toSlug } from '../data/test-data';

export const API_URL = process.env.API_URL ?? 'http://localhost:8091';

export interface NamedItem {
  id: string;
  name: string;
}

export class ToolshopApi {
  private token = '';
  private tokenCreatedAt = 0;

  constructor(
    private request: APIRequestContext,
    private email: string,
    private password: string,
  ) {}

  async login(): Promise<void> {
    const response = await this.request.post(`${API_URL}/users/login`, {
      data: { email: this.email, password: this.password },
    });
    expect(response.status(), 'API login').toBe(200);
    this.token = (await response.json()).access_token;
    this.tokenCreatedAt = Date.now();
  }

  // Tokens expire after 5 minutes, so get a new one before that happens
  private async headers() {
    if (Date.now() - this.tokenCreatedAt > 4 * 60 * 1000) {
      await this.login();
    }
    return { Authorization: `Bearer ${this.token}`, Accept: 'application/json' };
  }

  async createBrand(name: string): Promise<NamedItem> {
    const response = await this.request.post(`${API_URL}/brands`, {
      headers: await this.headers(),
      data: { name, slug: toSlug(name) },
    });
    expect(response.status(), 'create brand').toBe(201);
    return response.json();
  }

  async deleteBrand(id: string) {
    const response = await this.request.delete(`${API_URL}/brands/${id}`, { headers: await this.headers() });
    expect(response.status(), 'delete brand').toBe(204);
  }

  async createCategory(name: string): Promise<NamedItem> {
    const response = await this.request.post(`${API_URL}/categories`, {
      headers: await this.headers(),
      data: { name, slug: toSlug(name) },
    });
    expect(response.status(), 'create category').toBe(201);
    return response.json();
  }

  async deleteCategory(id: string) {
    const response = await this.request.delete(`${API_URL}/categories/${id}`, { headers: await this.headers() });
    expect(response.status(), 'delete category').toBe(204);
  }

  async firstImageId(): Promise<string> {
    const response = await this.request.get(`${API_URL}/images`, { headers: await this.headers() });
    expect(response.status(), 'get images').toBe(200);
    const images = await response.json();
    return images[0].id;
  }

  async createProduct(product: ProductData, brandId: string, categoryId: string) {
    return this.request.post(`${API_URL}/products`, {
      headers: await this.headers(),
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        brand_id: brandId,
        category_id: categoryId,
        product_image_id: await this.firstImageId(),
        is_location_offer: false,
        is_rental: false,
      },
    });
  }

  async getProduct(id: string) {
    return this.request.get(`${API_URL}/products/${id}`, { headers: await this.headers() });
  }

  async updateProduct(id: string, changes: Partial<ProductData>) {
    return this.request.patch(`${API_URL}/products/${id}`, {
      headers: await this.headers(),
      data: changes,
    });
  }

  async deleteProduct(id: string) {
    return this.request.delete(`${API_URL}/products/${id}`, { headers: await this.headers() });
  }

  async productsOfBrand(brandId: string): Promise<NamedItem[]> {
    const response = await this.request.get(`${API_URL}/products`, {
      headers: await this.headers(),
      params: { by_brand: brandId },
    });
    expect(response.status(), 'get products of brand').toBe(200);
    return (await response.json()).data;
  }

  async deleteProductsOfBrand(brandId: string) {
    for (const product of await this.productsOfBrand(brandId)) {
      const response = await this.deleteProduct(product.id);
      expect(response.status(), 'delete product').toBe(204);
    }
  }

  async searchProducts(query: string): Promise<NamedItem[]> {
    const response = await this.request.get(`${API_URL}/products/search`, {
      headers: await this.headers(),
      params: { q: query },
    });
    expect(response.status(), 'search products').toBe(200);
    return (await response.json()).data;
  }

  async registerUser(user: UserData): Promise<string> {
    const response = await this.request.post(`${API_URL}/users/register`, {
      headers: { Accept: 'application/json' },
      data: user,
    });
    expect(response.status(), 'register user').toBe(201);
    return (await response.json()).id;
  }

  async deleteUser(id: string) {
    const response = await this.request.delete(`${API_URL}/users/${id}`, { headers: await this.headers() });
    expect(response.status(), 'delete user').toBe(204);
  }
}
