# Challenge Sr Fullstack (Microservicios)

Repositorio monorepo con la solucion completa del challenge:

- backend base analizado y saneado (`nestjs-ecommerce`)
- backend evolucionado a microservicios event-driven (`microservices/*`)
- frontend React con Vite para validacion end-to-end (`react-ecommerce`)
- infraestructura de mensajeria: RabbitMQ local (`infra/docker-compose.yml`) para desarrollo; [CloudAMQP](https://cloudamqp.com) para produccion (Fly.io)

## 1) Problemas detectados en el diseno original

Principales hallazgos en `nestjs-ecommerce`:

- tests de controladores acoplados a modulos de DB y autenticacion
- e2e con problemas de cleanup (`app.close` sin ejecutar correctamente)
- dependencias fragiles en repositorios/mocks para e2e
- guard/auth y configuraciones con acoplamientos que dificultaban evolucion
- base monolitica poco preparada para desacople asincronico entre catalogo e inventario

Correcciones minimas aplicadas:

- aislamiento de tests unitarios de controladores
- estabilizacion de e2e con mocks y teardown correcto
- saneamiento basico para tener baseline reproducible antes de evolucionar

Detalle tecnico ampliado: `microservices/CHALLENGE_NOTES.md`.

## 2) Eventos implementados y por que

Se implementaron dos eventos de dominio relevantes:

1. `product.created`
   - productor: `catalog-service`
   - consumidor: `inventory-service`
   - objetivo: crear/asegurar el registro inicial de inventario de manera desacoplada

2. `inventory.updated`
   - productor: `inventory-service`
   - consumidor: `catalog-service`
   - objetivo: actualizar `lastKnownStock` como read model para consultas del catalogo

Con esto se evita comunicacion sincrona innecesaria entre modulos y se valida consistencia eventual.

## 3) Decisiones tecnicas relevantes

- Arquitectura por bounded contexts: `auth`, `catalog`, `inventory`, `api-gateway`
- Comunicacion asincronica por RabbitMQ para eventos de dominio (local: docker-compose; produccion: CloudAMQP)
- API Gateway como punto HTTP unico para el frontend
- Persistencia en [Neon](https://neon.tech) PostgreSQL (base de datos online `pg-ecommerce`), con enfoque de evolucion progresiva
- Frontend con React + Vite + TanStack Query + componentes estilo shadcn
- UI con actualizaciones optimistas para stock y manejo de asincronia

### 3.1) Frontend (react-ecommerce)

- **Custom hooks**: La logica de la pagina de productos (`useProductsPage`) esta encapsulada en `src/hooks/use-products-page.ts`. El componente `App` es puramente presentacional y consume datos, estado y handlers del hook.
- **TanStack Query**: `useQuery` para listado de productos (cache, `staleTime`), `useMutation` para crear producto y ajustar stock. Actualizaciones optimistas en `onMutate` con rollback en `onError` para una UX fluida sin saltos de pantalla.
- **Carpeta de types**: Los tipos del frontend estan centralizados en `src/types/` (`product.ts`, `products-page.ts`): `Product`, `ProductForm`, `CreateProductPayload`, `AdjustStockPayload`, `UseProductsPageResult`, etc.

## 4) Arquitectura backend

```mermaid
flowchart LR
  ReactApp[ReactEcommerceVite] --> ApiGateway[ApiGatewayNest]
  ApiGateway --> CatalogService[CatalogServiceNest]
  ApiGateway --> InventoryService[InventoryServiceNest]
  ApiGateway --> AuthService[AuthServiceNest]
  CatalogService --> EventBus[EventBusRabbitMQ]
  InventoryService --> EventBus
  EventBus --> CatalogConsumer[CatalogEventConsumer]
  EventBus --> InventoryConsumer[InventoryEventConsumer]
  CatalogService --> NeonDB[(NeonPostgres)]
  InventoryService --> NeonDB
  AuthService --> NeonDB
```

## 5) Como levantar el proyecto

### Prerrequisitos

- Node.js 20+ (recomendado)
- npm
- Docker (para RabbitMQ)

### Variables de entorno

Crear `.env` a partir de los `.env.example` en:

- `microservices/api-gateway/.env.example`
- `microservices/auth-service/.env.example`
- `microservices/catalog-service/.env.example`
- `microservices/inventory-service/.env.example`
- `react-ecommerce/.env.example`

### Arranque local

1. RabbitMQ:

```bash
cd infra
docker compose up -d
```

2. Microservicios (una terminal por servicio):

```bash
cd microservices/auth-service && npm run start:dev
cd microservices/catalog-service && npm run start:dev
cd microservices/inventory-service && npm run start:dev
cd microservices/api-gateway && npm run start:dev
```

3. Frontend:

```bash
cd react-ecommerce
npm run dev
```

## 6) Validacion de calidad

Suites ejecutadas y pasando en esta solucion:

- monolito `nestjs-ecommerce`: unit + e2e
- `microservices/*`: unit + e2e por servicio
- `react-ecommerce`: `type-check` + tests
- builds de backend y frontend

## 7) URLs publicas de acceso

App desplegada en [Fly.io](https://fly.io):

| Servicio                  | URL                                |
| ------------------------- | ---------------------------------- |
| **Frontend**              | https://aleo-ecom-frontend.fly.dev |
| **API Gateway (Backend)** | https://aleo-ecom-gateway.fly.dev  |
| **Base de datos**         | Neon PostgreSQL (`pg-ecommerce`)   |

Ejemplos de endpoints del API Gateway:

- `GET /products` — listado de productos
- `POST /products` — crear producto
- `PATCH /inventory/adjust` — ajustar stock

URLs locales para desarrollo:

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:3010`
- RabbitMQ UI: `http://localhost:15672`
