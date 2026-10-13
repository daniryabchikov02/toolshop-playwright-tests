import { Locator, Page } from '@playwright/test';

export class Header {
  readonly signInLink: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
  }
}
