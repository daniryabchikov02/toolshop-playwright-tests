# Toolshop Playwright Tests

Playwright + TypeScript tests for the Practice Software Testing Toolshop app, running against a local Docker instance.

## What's covered

- Login: valid customer login, and a wrong password showing an error without logging the user in.
- Admin product CRUD: create a product, check it in the admin list, the edit form, storefront search and the product page, update its name and price, then delete it and check it's gone everywhere.
- Form validation: missing name, price that isn't a number, and a negative price, which is a known bug.
- API test: the same create, read, update, delete flow through the REST API.
- GitHub Actions workflow that starts Toolshop and runs the whole suite.

## Project structure

```
tests/      test files
pages/      page objects
fixtures/   page objects and admin API client for each test
api/        helper for the Toolshop REST API
data/       seeded accounts and test data
.github/    CI workflow
```

## Running locally

You need Docker and Node.js 20 or newer. I used Node 24.

Start Toolshop:

```bash
git clone https://github.com/testsmith-io/practice-software-testing.git
cd practice-software-testing
docker compose up -d
docker compose exec laravel-api php artisan migrate:fresh --seed
```

The first start takes a few minutes. Wait until http://localhost:4200 loads.

Install and run the tests:

```bash
npm install
npx playwright install chromium
npm test
```

- `npm run test:headed` runs with the browser visible
- `npm run report` opens the HTML report from the last run

The URLs default to `http://localhost:4200` and `http://localhost:8091`. Use `BASE_URL` and `API_URL` to change them.

## Approach

- Elements are found by the app's `data-test` attributes.
- Page objects only have elements and actions. The checks are in the tests.
- Tests that need a brand, category or user create it through the API and delete it afterwards, even if a test fails halfway. Names look like `AUTOTEST-<timestamp>-<random> Hammer`. Products are cleaned up by brand, since each run has its own.
- No fixed waits, only Playwright's built-in waiting and assertions.
- The CRUD tests run in order because each step uses the product from the step before.
- No retries. The full suite passed 10 repeated runs in parallel with 4 and with 8 workers, without failures.

## Assumptions

- Toolshop runs with its default Docker setup. CI always uses the same Toolshop version, so updates on their side don't affect it.
- The database needs to be seeded after starting Toolshop. The setup steps in the assessment don't include it, but the API returns errors until it's done.
- The seeded admin and customer accounts are used as given.
- Product images are built-in app data, so the tests use the first available image instead of uploading one.
- Chromium only.

## Issues found

Bugs:

1. A negative price is accepted. A product with price `-5` saves through both the form and the API. The test for it is marked `test.fail`, so the suite stays green and Playwright will flag it once it's fixed.
2. The edit product form doesn't load brand, category, image and stock. The API leaves those fields out, so the form opens with them empty and can't be saved until they're filled in again. The update test fills the whole form because of this.

Other things the tests work around:

- Customer accounts lock after 3 failed logins, so the wrong password test uses its own user instead of the shared customer account.
- Product search ignores words shorter than 3 characters. My first prefix was `QA-`, which made products impossible to find.
- The storefront search box ignores anything longer than 40 characters without showing an error.
- API tokens expire after 5 minutes, so the API helper gets a new one before that.
- In CI the Toolshop API couldn't write its log files on Linux because of file ownership. The workflow turns logging off and fixes the permissions.

## CI

`.github/workflows/tests.yml` runs on pushes to `main`, pull requests, and manually from the Actions tab. It starts Toolshop, seeds the database, waits for the app, runs the tests and uploads the HTML report as an artifact.

## AI use

I used an AI coding assistant for most of the implementation: going through the Toolshop source for selectors and API behaviour, writing the page objects and tests, and debugging the CI setup. I made the decisions on the framework, the structure, how to handle the two bugs, and kept the code simple on purpose. I reviewed the changes before committing, checked the CI runs, and had fixes re-run locally before pushing them. A few first attempts were wrong and only showed up once the tests ran: the `QA-` prefix broke search, a long product name hit the 40 character search limit, and the first CI runs failed on type checking and on the API file permissions.

## What I'd add next

- Log in through the API and reuse the session in the product tests instead of going through the login page every time. It would make the suite faster.
- Permission tests, checking a customer can't open admin pages or call admin-only API endpoints.
- Run on Firefox and WebKit too.
- Cache the Toolshop Docker images and the Playwright browser in CI. A run takes about 6.5 minutes now, mostly building Toolshop.
