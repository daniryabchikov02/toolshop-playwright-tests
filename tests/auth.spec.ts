import { test, expect } from '../fixtures';
import { users } from '../data/users';
import { newUser, UserData } from '../data/test-data';

test.describe('Login', () => {
  test('customer can log in with valid credentials', async ({ page, loginPage, accountPage, header }) => {
    await loginPage.goto();
    await loginPage.login(users.customer.email, users.customer.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.pageTitle).toHaveText('My account');
    await expect(header.userMenu).toHaveText(users.customer.name);
    expect(await loginPage.storedToken()).toBeTruthy();
  });

  test.describe('with a wrong password', () => {
    let user: UserData;
    let userId: string;

    test.beforeAll(async ({ adminApi }) => {
      user = newUser();
      userId = await adminApi.registerUser(user);
    });

    test.afterAll(async ({ adminApi }) => {
      if (userId) {
        await adminApi.deleteUser(userId);
      }
    });

    test('shows an error and does not log the user in', async ({ page, loginPage, header }) => {
      await loginPage.goto();
      await loginPage.login(user.email, 'WrongPassword1!');

      await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
      await expect(page).toHaveURL(/\/auth\/login$/);
      await expect(header.signInLink).toBeVisible();
      await expect(header.userMenu).toBeHidden();
      expect(await loginPage.storedToken()).toBeNull();
    });
  });
});
