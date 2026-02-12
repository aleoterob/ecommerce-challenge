# Challenge Notes

## 1) Initial diagnosis (`nestjs-ecommerce`)

Main issues found in the original codebase:

1. Controller unit tests coupled to database modules and auth guards.
2. E2E tests with teardown bug (`app.close` referenced but not called).
3. E2E tests depended on hard-coded repository string tokens.
4. Auth guard directly consumed `process.env` and had fragile failure behavior.
5. Product module relied heavily on `EntityManager`, making domain evolution harder.

## 2) Minimal fixes applied before evolution

- Controller tests decoupled from DB imports.
- E2E setup fixed to use `getRepositoryToken(User)` and proper async cleanup.
- Teardown corrected to `await app.close()`.

These changes keep behavior intact while making the baseline reliable enough to evolve.

## 3) Event-driven microservices design

Services:

- `api-gateway` (HTTP, orchestrates requests to services through RMQ)
- `auth-service` (user registration/login/profile)
- `catalog-service` (product query + creation, stock read model)
- `inventory-service` (stock write model)

Domain events implemented:

1. `product.created`
   - Producer: `catalog-service`
   - Consumer: `inventory-service`
   - Purpose: initialize stock entry asynchronously, without direct service call.

2. `inventory.updated`
   - Producer: `inventory-service`
   - Consumer: `catalog-service`
   - Purpose: update `lastKnownStock` read model in catalog asynchronously.

## 4) Why this design

- Event emission at natural domain boundaries.
- No direct synchronous module-to-module invocation for stock synchronization.
- Clear separation between write model (`inventory`) and read representation (`catalog`).
- Frontend can validate eventual consistency by refreshing product list after stock updates.
