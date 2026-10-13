import { test as base } from '@playwright/test';
import { ToolshopApi } from '../api/toolshop-api';
import { users } from '../data/users';
import { AccountPage } from '../pages/account.page';
import { AdminProductsPage } from '../pages/admin-products.page';
import { Header } from '../pages/header';
import { LoginPage } from '../pages/login.page';
import { ProductFormPage } from '../pages/product-form.page';
import { StorefrontPage } from '../pages/storefront.page';

type Pages = {
  loginPage: LoginPage;
  accountPage: AccountPage;
  header: Header;
  adminProductsPage: AdminProductsPage;
  productFormPage: ProductFormPage;
  storefrontPage: StorefrontPage;
};

type Workers = {
  adminApi: ToolshopApi;
};

export const test = base.extend<Pages, Workers>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  accountPage: async ({ page }, use) => use(new AccountPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
  adminProductsPage: async ({ page }, use) => use(new AdminProductsPage(page)),
  productFormPage: async ({ page }, use) => use(new ProductFormPage(page)),
  storefrontPage: async ({ page }, use) => use(new StorefrontPage(page)),

  adminApi: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext();
      const api = new ToolshopApi(request, users.admin.email, users.admin.password);
      await api.login();
      await use(api);
      await request.dispose();
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
