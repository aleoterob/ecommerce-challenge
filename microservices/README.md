# Microservices Backend

## Services

- `api-gateway` (port 3000): public HTTP API.
- `auth-service`: RMQ microservice queue `auth_queue`.
- `catalog-service`: RMQ microservice queue `catalog_queue`.
- `inventory-service`: RMQ microservice queue `inventory_queue`.

All services use RabbitMQ (`RABBITMQ_URL`) for communication.

## Events

- `product.created`
- `inventory.updated`

## Local run

1. Start RabbitMQ:

```bash
cd ../infra
docker compose up -d
```

2. Start each service in separate terminals:

```bash
cd api-gateway && npm run start:dev
cd auth-service && npm run start:dev
cd catalog-service && npm run start:dev
cd inventory-service && npm run start:dev
```

3. Set environment files based on each `.env.example`.

## Neon/Postgres configuration

Each service accepts a dedicated database URL:

- `AUTH_DATABASE_URL`
- `CATALOG_DATABASE_URL`
- `INVENTORY_DATABASE_URL`

If dedicated URLs are not provided, services fallback to `DATABASE_URL`.

For rapid validation the current setup uses `synchronize: true`.
Recommended production hardening:

- add migration files per service
- set `synchronize: false`
- run migrations during deploy pipeline

## Neon migration command

From `catalog-service`, run:

```bash
DATABASE_URL=postgresql://... npm run migrate:neon
```

This creates (idempotently) the required shared tables:

- `users`
- `products`
- `inventory_items`
