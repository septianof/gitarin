# 🧪 Unit Testing Guide

## Setup

Unit testing sudah dikonfigurasi menggunakan **Vitest**.

### Files
- `vitest.config.ts` - Vitest configuration
- `src/__tests__/setup.ts` - Global test setup & mocks
- `src/app/actions/__tests__/landing-page.test.ts` - Unit tests untuk landing page actions

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## Test Coverage

### Landing Page Actions

**getPopularCategories()**
- ✅ Returns 3 categories sorted by order items
- ✅ Filters deleted categories
- ✅ Handles errors gracefully
- ✅ Includes product count

**getFeaturedProducts()**
- ✅ Returns 4 products sorted by price (desc)
- ✅ Filters stock > 0 and not deleted
- ✅ Includes category relation
- ✅ Handles errors gracefully
- ✅ Validates ordering and limit

## Writing New Tests

Create test file in `__tests__` folder:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("My Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

## Mocking Prisma

Prisma sudah di-mock di `setup.ts`. Untuk custom mock:

```typescript
vi.mocked(prisma.model.method).mockResolvedValue(mockData);
```
