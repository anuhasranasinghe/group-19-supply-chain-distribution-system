# Group 19 — Work Breakdown Structure & Architectural Commit Sequencing Guide

## 1. Project Overview & Division Strategy

This document defines the team work allocation and commit order for the **Kandypack Supply Chain Distribution System (SCDS)** project.

### Core Rules & Constraints Enforced:
1. **Database Exclusion**: All SQL database schema files (`database/schema/`, `database/functions/`, `database/triggers/`) are excluded from this breakdown as they are handled in separate SQL assignments.
2. **Frontend Distribution**: Frontend development is assigned exclusively to **2 team members** (Anuhas & Praveen) to ensure UI design consistency and avoid component duplication.
3. **Backend Distribution**: Backend development is distributed across **all 5 team members** (Anuhas, Praveen, Thanachayen, Athishaya, Dakshitha) partitioned logically by business domain.
4. **Workload Balancing**: Responsibilities are balanced according to complexity and line-count metrics across the team.
5. **Architectural Commit Ordering**: Files are ordered according to strict software engineering dependency principles (Types → Config → Middleware → Services → Controllers → Routes → Application/UI).

---

## 2. Commit Order Rationale (Software Dependency Hierarchy)

In a professional full-stack project, committing files in random order causes broken builds and merge conflicts. The project **MUST** be committed according to the following 6-tier architectural hierarchy:

```
Tier 1: Core Types & Environment Config
   └── Tier 2: Validation Schemas & Custom Error Handlers / Middleware
        └── Tier 3: Service Layer (Business Logic & Database Queries)
             └── Tier 4: Controller Layer (HTTP Request Handlers)
                  └── Tier 5: Route Definitions (API Endpoints & Guards)
                       └── Tier 6: App Server Setup & Frontend Views
```

### Why this specific order?
- **Services before Controllers**: Controllers import services. If you commit a controller before its service exists, TypeScript compiler errors occur.
- **Controllers before Routes**: Route files map URL endpoints to controller methods. Routes cannot compile without controllers.
- **Types & Utils before Everything**: Types and error classes are imported by services, middleware, and controllers alike. They form the foundational contract.
- **Frontend Core before Pages**: Feature pages rely on `AuthContext`, `api/client.ts`, and `types/`. The layout shell (`AppLayout` & `Sidebar`) must be committed before page routes are wired up in `App.tsx`.

---

## 3. Team Member Work Allocations & Step-by-Step Commit Guide

---

### 👤 Member 1: Anuhas (Team & Tech Lead)
**Focus**: Backend Core Architecture, Auth & User System + Frontend Core & Layout  
**Scope**: 14 Backend Files + 14 Frontend Files

#### Backend Responsibilities (`backend/src/`):
- Foundational types, constants, environment config, and Postgres database pool connection.
- Custom error hierarchy (`AppError`, `ValidationError`, `UnauthorizedError`, etc.) and JWT generation/verification utilities.
- Central Express middleware (`authenticate`, `authorize`, `validate`, `errorHandler`).
- Zod validation schemas (`validators/schemas.ts`).
- Auth & User management services, controllers, and routes.
- Central Express app setup (`app.ts`) and HTTP server entry point (`server.ts`).

#### Frontend Responsibilities (`frontend/src/`):
- TypeScript interfaces matching backend models (`types/index.ts`).
- Utility functions (`lib/utils.ts` — date, currency, status badge helpers).
- Axios API Client with HttpOnly cookie interceptors (`api/client.ts`).
- Global Auth Context provider (`contexts/AuthContext.tsx`).
- Protected route guard (`components/common/ProtectedRoute.tsx`).
- Layout components (`components/layout/AppLayout.tsx`, `Sidebar.tsx`).
- CSS Design System (`index.css`) & root entry (`App.tsx`, `main.tsx`).
- Authentication pages (`LoginPage.tsx`, `RegisterPage.tsx`), `DashboardPage.tsx`, and `NotificationsPage.tsx`.

#### Anuhas's Step-by-Step Commit Sequence:
1. `backend/src/config/constants.ts` & `backend/src/config/environment.ts`
2. `backend/src/types/index.ts` & `backend/src/types/express.ts`
3. `backend/src/utils/errors.ts`, `backend/src/utils/password.ts`, & `backend/src/utils/jwt.ts`
4. `backend/src/database/connection.ts`
5. `backend/src/validators/schemas.ts`
6. `backend/src/middleware/errorHandler.ts`, `validate.ts`, `authenticate.ts`, `authorize.ts`
7. `backend/src/services/authService.ts` & `services/userService.ts`
8. `backend/src/controllers/authController.ts` & `controllers/userController.ts`
9. `backend/src/routes/authRoutes.ts` & `routes/userRoutes.ts`
10. `backend/src/app.ts` & `backend/src/server.ts`
11. `frontend/src/types/index.ts` & `frontend/src/lib/utils.ts`
12. `frontend/src/api/client.ts` & `frontend/src/contexts/AuthContext.tsx`
13. `frontend/src/components/common/ProtectedRoute.tsx`
14. `frontend/src/components/layout/Sidebar.tsx` & `AppLayout.tsx`
15. `frontend/src/index.css`, `App.tsx`, `main.tsx`
16. `frontend/src/pages/auth/LoginPage.tsx`, `RegisterPage.tsx`, `DashboardPage.tsx`, `NotificationsPage.tsx`

---

### 👤 Member 2: Praveen (Backend Master Data + Frontend Operations Lead)
**Focus**: Backend Catalogue & Store Domain + All Frontend Management & Logistics Views  
**Scope**: 9 Backend Files + 12 Frontend Files

#### Backend Responsibilities (`backend/src/`):
- Product catalogue business logic, controller, and routes (`productService`, `productController`, `productRoutes`).
- Regional store management logic, controller, and routes (`storeService`, `storeController`, `storeRoutes`).
- Delivery route area coverage logic, controller, and routes (`routeService`, `routeController`, `routeRoutes`).

#### Frontend Responsibilities (`frontend/src/`):
- Customer Order views (`OrdersPage.tsx`, `PlaceOrderPage.tsx` with 7-day advance date validation).
- Administration views (`ProductsPage.tsx`, `StoresPage.tsx`, `RoutesPage.tsx`, `UsersPage.tsx`, `ReportsPage.tsx`).
- Logistics operations views (`TrainTripsPage.tsx`, `AllocationsPage.tsx`, `TrucksPage.tsx`, `TruckTripsPage.tsx`, `DeliveriesPage.tsx`).

#### Praveen's Step-by-Step Commit Sequence:
1. `backend/src/services/productService.ts` → `controllers/productController.ts` → `routes/productRoutes.ts`
2. `backend/src/services/storeService.ts` → `controllers/storeController.ts` → `routes/storeRoutes.ts`
3. `backend/src/services/routeService.ts` → `controllers/routeController.ts` → `routes/routeRoutes.ts`
4. `frontend/src/pages/admin/ProductsPage.tsx`, `StoresPage.tsx`, `RoutesPage.tsx`, `UsersPage.tsx`
5. `frontend/src/pages/orders/OrdersPage.tsx` & `PlaceOrderPage.tsx`
6. `frontend/src/pages/logistics/TrainTripsPage.tsx`, `AllocationsPage.tsx`, `TrucksPage.tsx`, `TruckTripsPage.tsx`, `DeliveriesPage.tsx`
7. `frontend/src/pages/admin/ReportsPage.tsx`

---

### 👤 Member 3: Thanachayen (Backend Order Engine & Notification Specialist)
**Focus**: Order Placement Engine & In-App Notification System  
**Scope**: 6 Backend Files

#### Backend Responsibilities (`backend/src/`):
- Order creation & processing logic (`orderService.ts` — 7-day advance order rules, route validation, transaction handling).
- Order controller (`orderController.ts` — data-level customer authorization).
- Order routes (`orderRoutes.ts`).
- Notification management service (`notificationService.ts` — user notification queries & unread badges).
- Notification controller (`notificationController.ts`).
- Notification routes (`notificationRoutes.ts`).

#### Thanachayen's Step-by-Step Commit Sequence:
1. `backend/src/services/orderService.ts`
2. `backend/src/controllers/orderController.ts`
3. `backend/src/routes/orderRoutes.ts`
4. `backend/src/services/notificationService.ts`
5. `backend/src/controllers/notificationController.ts`
6. `backend/src/routes/notificationRoutes.ts`

---

### 👤 Member 4: Athishaya (Backend Logistics & Dispatch Systems Lead)
**Focus**: Primary Logistics Domain — Train Cargo & Road Truck Fleet Operations  
**Scope**: 12 Backend Files

#### Backend Responsibilities (`backend/src/`):
- Train trip schedule management (`trainTripService.ts`, `trainTripController.ts`, `trainTripRoutes.ts`).
- Train cargo space allocation & split procedure caller (`trainAllocationService.ts`, `trainAllocationController.ts`, `trainAllocationRoutes.ts`).
- Truck fleet management (`truckService.ts`, `truckController.ts`, `truckRoutes.ts`).
- Truck trip scheduling & dispatch (`truckTripService.ts`, `truckTripController.ts`, `truckTripRoutes.ts` — handling driver/assistant weekly working-hour checks and overlapping window validations).

#### Athishaya's Step-by-Step Commit Sequence:
1. `backend/src/services/trainTripService.ts` → `controllers/trainTripController.ts` → `routes/trainTripRoutes.ts`
2. `backend/src/services/trainAllocationService.ts` → `controllers/trainAllocationController.ts` → `routes/trainAllocationRoutes.ts`
3. `backend/src/services/truckService.ts` → `controllers/truckController.ts` → `routes/truckRoutes.ts`
4. `backend/src/services/truckTripService.ts` → `controllers/truckTripController.ts` → `routes/truckTripRoutes.ts`

---

### 👤 Member 5: Dakshitha (Backend Deliveries & Analytics Reports Lead)
**Focus**: Last-Mile Delivery Tracking State Machine & Business Intelligence Reports  
**Scope**: 6 Backend Files

#### Backend Responsibilities (`backend/src/`):
- Last-mile delivery tracking (`deliveryService.ts` — status transition state machine from `Pending` → `Scheduled` → `Delivered`/`Failed` → `Returned`, stored procedure integration).
- Delivery controller (`deliveryController.ts`).
- Delivery routes (`deliveryRoutes.ts`).
- Business Intelligence Report Aggregation Service (`reportService.ts` — queries for 7 SRS reports: Quarterly Sales, Top Products, City Sales, Route Sales, Worker Hours, Truck Usage, Customer History).
- Report controller (`reportController.ts`).
- Report routes (`reportRoutes.ts`).

#### Dakshitha's Step-by-Step Commit Sequence:
1. `backend/src/services/deliveryService.ts`
2. `backend/src/controllers/deliveryController.ts`
3. `backend/src/routes/deliveryRoutes.ts`
4. `backend/src/services/reportService.ts`
5. `backend/src/controllers/reportController.ts`
6. `backend/src/routes/reportRoutes.ts`

---

## 4. Workload Balancing Matrix

| Team Member | Work Domain | Backend Files | Frontend Files | Total Files | Estimated Complexity / Lines |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Anuhas** | Architecture, Auth, User Systems & Frontend Core | 14 | 14 | **28** | **High** (Core boilerplate, middleware, auth context, layout shell) |
| **Praveen** | Master Data, Stores, Routes & Frontend Views | 9 | 12 | **21** | **High** (Catalog/Store backend + all 12 React feature pages) |
| **Thanachayen**| Order Placement Engine & Notifications | 6 | 0 | **6** | **Medium-High** (Complex transaction order placing & 7-day rule) |
| **Athishaya**  | Train & Truck Logistics Operations | 12 | 0 | **12** | **Medium-High** (4 complete backend domains: trains, allocations, fleet, trips) |
| **Dakshitha**  | Last-Mile State Machine & BI Analytics Reports | 6 | 0 | **6** | **Medium-High** (Complex status state machine + 7 heavy aggregate SQL reports) |

---

## 5. Team Git Workflow & Commit Guidelines

When working in the `/home/anuhas/programming/group-19-supply-chain-distribution-system` repository, each member should follow this protocol:

1. **Branch Naming**: Each member creates a feature branch:
   - `git checkout -b feature/auth-and-core` (Anuhas)
   - `git checkout -b feature/master-data-and-views` (Praveen)
   - `git checkout -b feature/order-engine` (Thanachayen)
   - `git checkout -b feature/logistics-dispatch` (Athishaya)
   - `git checkout -b feature/deliveries-and-reports` (Dakshitha)

2. **Sequential Commit Execution**:
   - Follow the numbered commit sequences listed above.
   - Commit logical file pairs together (e.g. `git commit -m "feat(backend): add productService, productController, and productRoutes"`).

3. **Pull Request & Integration**:
   - Push feature branches to GitHub: `git push -u origin feature/<name>`
   - Open Pull Requests into `main` in the order of Tier 1 → Tier 2 → Tier 3 → Tier 4 → Tier 5 → Tier 6.
