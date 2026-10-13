import { Locator, Page } from '@playwright/test';

export class AccountPage {
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.pageTitle = page.getByTestId('page-title');
  }
}
