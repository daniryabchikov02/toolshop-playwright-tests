export interface ProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
}

export interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// The product search ignores words shorter than 3 characters and the storefront
// search box allows at most 40 characters, so keep labels short and simple
export function uniqueName(label: string): string {
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `AUTOTEST-${Date.now()}-${random} ${label}`;
}

export function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function newProduct(brand: string, category: string): ProductData {
  const name = uniqueName('Hammer');
  return {
    name,
    description: `Created by automated test: ${name}`,
    price: 19.99,
    stock: 10,
    brand,
    category,
  };
}

export function newUser(): UserData {
  const random = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  return {
    first_name: 'QA',
    last_name: 'Tester',
    email: `qa-${random}@example.com`,
    password: `Qa!${random}Pass`,
  };
}
