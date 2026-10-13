# Rail and Road-based Supply Chain Distribution System (SCDS)

> **A full-stack, enterprise-grade logistics and distribution management platform developed for Kandypack, an FMCG manufacturer based in Kandy, Sri Lanka.**  
> Built as the Semester 3 Database Systems Project | **Group 19**  
> **Department of Computer Science & Engineering, University of Moratuwa**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Team Members & Individual Contributions](#team-members--individual-contributions)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Domain Model & Entity Relationships](#domain-model--entity-relationships)
6. [Business Rules & Logistics Constraints](#business-rules--logistics-constraints)
7. [Database Design & Schema Enhancements](#database-design--schema-enhancements)
8. [Management Reports & BI Suite](#management-reports--bi-suite)
9. [REST API Design](#rest-api-design)
10. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
11. [How to Run the Project](#how-to-run-the-project)
12. [Docker & Development Workflow](#docker--development-workflow)
13. [License & Acknowledgments](#license--acknowledgments)

---

## Project Overview

The **Rail and Road-based Supply Chain Distribution System (SCDS)** modernizes and replaces traditional manual/spreadsheet-based logistics tracking for **Kandypack**, a premier Fast-Moving Consumer Goods (FMCG) manufacturer headquartered in Kandy.

### The Problem & Real-World Domain
Kandypack distributes high-demand consumer goods from its primary manufacturing hub in Kandy to major economic centers across Sri Lanka: **Colombo, Negombo, Galle, Matara, Jaffna, Trincomalee, and Batticaloa**. Bulk transportation relies on scheduled cargo wagons via **Sri Lanka Railways**, with regional stores located near railway stations serving as destination hubs. From these hubs, a dedicated fleet of company trucks dispatches goods for last-mile customer delivery.

The system addresses critical operational challenges:
- **Intermodal Freight Capacity Limits**: Train trips have fixed volumetric cargo quotas. When bulk orders exceed train capacities, excess cargo must automatically and transparently roll over to subsequent trips.
- **Volumetric Space Consumption Rates**: FMCG products vary in physical bulk. Space consumption rates (e.g. $0.5\text{ units/box}$) must be strictly enforced.
- **Strict Crew Fatigue & Rostering Compliance**: Road safety regulations require strict roster rules for drivers and assistants (e.g., driver weekly limit $\le 40$ hours, assistant limit $\le 60$ hours, no two consecutive deliveries for drivers, maximum two consecutive routes for assistants, and zero schedule overlapping).
- **Advance Demand Forecasting**: All customer orders must be placed at least **7 days in advance** and verified against spatial route coverage.
- **Real-Time Automated Fulfillment Tracking**: Real-time status transitions from train freight to last-mile truck dispatch, culminating in automated rollup of parent orders upon verified delivery.

> **Core Academic Objective:**  
> This system is built **without Object-Relational Mappings (ORMs)**. All database queries, transactions, aggregations, stored procedures, and triggers are written in **manual, parameterized Raw PostgreSQL (PL/pgSQL)** via the `pg` driver to demonstrate foundational mastery of enterprise relational database systems.

---

## Team Members & Individual Contributions

| # | Student Name | Index Number | Primary Engineering Focus |
|---|--------------|--------------|--------------------------|
| 1 | **Ranasinghe R. G. A. D. B** | **240548C** | **Team & Technical Lead:** Backend Core Architecture, Auth & Security, User Domain, Frontend Core & Enterprise Shell |
| 2 | **Jayarathna M. G. P. S** | **240267M** | **Master Data & Frontend Lead:** Product Catalogue, Regional Stores & Routes, All React Management & Operations Views |
| 3 | **E. Thanancheyan** | **240645V** | **Order Engine Specialist:** Multi-Item Order Transaction Engine, 7-Day Business Rule Validation, In-App Notifications |
| 4 | **Athishaya J.** | **240051V** | **Logistics & Dispatch Lead:** Railway Freight Scheduling, Cargo Allocation & Spillover, Road Fleet Dispatch & Crew Rostering |
| 5 | **Wijerathne W. D. D** | **220715T** | **Fulfillment & BI Analytics Lead:** Last-Mile State Machine, Automated Rollup Triggers, 7 SRS Analytical Reports |

---

### Detailed Contribution Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  GROUP 19 ENGINEERING MATRIX                                    │
├──────────────────────┬──────────────────────────────────────────┬───────────────────────────────┤
│ Team Member          │ Systems & Software Engineering Focus    │ Database & SQL Engineering    │
├──────────────────────┼──────────────────────────────────────────┼───────────────────────────────┤
│ Ranasinghe R.G.A.D.B │ • Central Express 5 HTTP architecture    │ • Base ISA Identity Tables    │
│ (240548C - Anuhas)   │ • JWT HttpOnly cookie security & CORS    │ • Cascade Foreign Keys        │
│                      │ • Global auth context & route guards     │ • Temporal audit trail trigger│
│                      │ • Admin dashboard live Recharts suite    │ • Password hash seed dataset  │
├──────────────────────┼──────────────────────────────────────────┼───────────────────────────────┤
│ Jayarathna M.G.P.S   │ • Master Data catalogue & store services │ • Topography DDL tables       │
│ (240267M - Praveen)  │ • All 12 React administrative interfaces │ • Multi-column spatial indexes│
│                      │ • Customer order placement forms         │ • Store inventory unique keys │
│                      │ • Fleet scheduling operational views     │ • Regional depot seed data    │
├──────────────────────┼──────────────────────────────────────────┼───────────────────────────────┤
│ E. Thanancheyan      │ • Order creation transactional workflow  │ • Master-Detail order schema  │
│ (240645V)            │ • 7-day advance verification engine      │ • 7-day CHECK constraint      │
│                      │ • User-level data isolation controllers  │ • Atomic place_order procedure│
│                      │ • In-app alert notification services     │ • 40+ order seed test cases   │
├──────────────────────┼──────────────────────────────────────────┼───────────────────────────────┤
│ Athishaya J.         │ • Rail freight trip planning services    │ • M:N Junction allocations    │
│ (240051V)            │ • Volumetric space consumption splitters │ • 4 Roster & overlap triggers │
│                      │ • Truck fleet scheduling state guards    │ • Weekly hour PL/pgSQL funcs  │
│                      │ • Crew conflict & fatigue roster checks  │ • Timetable & fleet datasets  │
├──────────────────────┼──────────────────────────────────────────┼───────────────────────────────┤
│ Wijerathne W.D.D     │ • Last-mile fulfillment state machine    │ • Delivery item fulfillment   │
│ (220715T - Dakshitha)│ • 7 Business Intelligence report engines │ • delivery_completion_rollup  │
│                      │ • Interactive report charts & CSV export │ • Analytical GROUP BY queries │
│                      │ • Delivery status transition handlers    │ • Comprehensive BI test data  │
└──────────────────────┴──────────────────────────────────────────┴───────────────────────────────┘
```

#### 👤 1. Ranasinghe R. G. A. D. B — 240548C (Anuhas)
**Role:** Team & Technical Lead  
**Core Responsibilities:** Backend Core Architecture, Authentication & Security, User Domain, Frontend Core & Enterprise Shell

* **Systems Architecture & Security:**
  - Designed and configured the centralized Express.js 5 HTTP server (`app.ts`, `server.ts`) and global middleware pipeline.
  - Implemented secure authentication with **JWT stored in HttpOnly, SameSite cookies** to prevent XSS and CSRF token interception.
  - Engineered the custom error classification hierarchy (`AppError`, `ValidationError`, `UnauthorizedError`, `ConflictError`, `NotFoundError`).
  - Created central authorization guards (`authenticate.ts`, `authorize.ts`) enforcing role-based access control across all 6 user roles.
  - Structured domain-wide request validation pipelines using Zod schemas (`validators/schemas.ts`).
  - Developed user account management services and self-profile controllers (`authService.ts`, `userService.ts`).

* **Frontend Architecture & UI Shell:**
  - Architected the modern React 19 + TypeScript application foundation, establishing type contracts (`types/index.ts`) matching backend models.
  - Configured the centralized Axios API client (`api/client.ts`) with automatic credential inclusion and unified interceptor error normalization.
  - Built the global `AuthContext` provider managing real-time session validation and permission state.
  - Implemented the secure `ProtectedRoute` guard ensuring unauthenticated or unauthorized users cannot access restricted routes.
  - Crafted the complete layout shell (`AppLayout.tsx`, `Sidebar.tsx`, modern navigation headers, dynamic role-based menus).
  - Developed the **Enterprise Landing Page** (`LandingPage.tsx`), Auth pages (`LoginPage.tsx`, `RegisterPage.tsx`), and in-app Notification Center (`NotificationsPage.tsx`).
  - Engineered the **Admin Dashboard** (`DashboardPage.tsx`) featuring real-time stat aggregations, recent order monitoring, and an interactive **dual-axis Recharts sales chart** directly connected to backend APIs.

* **Database Engineering & SQL Implementation:**
  - **DDL Tables (`01_tables.sql`):** Designed the base ISA identity hierarchy: `users` (base entity), `customers` (child entity), `workers` (child entity), and `notifications`.
  - **Foreign Key Relationships (`02_relationships.sql`):** Created 1:1 ISA inheritance foreign keys with `ON DELETE CASCADE` between child tables and `users`.
  - **Check Constraints (`03_constraints.sql`):** Enforced domain constraints on system roles (`chk_users_system_role`), worker types (`chk_workers_type`), hourly wages (`chk_workers_hourly_pay`), and notification categories (`chk_notifications_type`).
  - **Indexing (`04_indexes.sql`):** Built multi-column B-tree indexes for fast notification lookups (`idx_notifications_user_id`, `idx_notifications_unread`, `idx_notifications_user_created`).
  - **Triggers (`database/triggers/`):** Implemented `order_status_history.sql` with the trigger function `log_order_status_change()`, automating temporal audit logging on status changes.
  - **Seed Dataset (`database/seed/seed_data.sql`):** Populated the complete user ecosystem with pre-computed bcrypt password hashes across all roles.

---

#### 👤 2. Jayarathna M. G. P. S — 240267M (Praveen)
**Role:** Backend Master Data & Frontend Operations Lead  
**Core Responsibilities:** Product Catalogue, Store Locations, Delivery Route Coverage & All Frontend Operational Views

* **Backend Master Data & Supply Chain Topography:**
  - Engineered the FMCG product catalogue management system (`productService.ts`, `productController.ts`, `productRoutes.ts`), handling unit pricing and train volumetric space consumption metrics.
  - Developed the regional store depot services (`storeService.ts`, `storeController.ts`, `storeRoutes.ts`), connecting destination train stations to local logistics centers and assigned store managers.
  - Implemented the last-mile delivery route mapping engine (`routeService.ts`, `routeController.ts`, `routeRoutes.ts`), managing route areas, store assignments, and maximum delivery duration thresholds.

* **Frontend Operational & Management Interface Suite:**
  - Designed and built all primary administrative management portals:
    - **Products Page** (`ProductsPage.tsx`): Catalogue overview, price adjustments, and volumetric space rate parameters.
    - **Stores Page** (`StoresPage.tsx`): Regional railway-adjacent store configurations and manager assignments.
    - **Routes Page** (`RoutesPage.tsx`): Predefined last-mile delivery routes with maximum transit times.
    - **Users Page** (`UsersPage.tsx`): Administrative staff account provisioning, wage rates, and role updates.
    - **Reports Hub** (`ReportsPage.tsx`): Management navigation portal for analytical business intelligence.
  - Built the Customer Order Placement workflows (`PlaceOrderPage.tsx`), integrating the calendar picker enforcing the 7-day advance delivery rule and customer order review tables (`OrdersPage.tsx`).
  - Created the complete operational logistics interface suite:
    - **Train Trips Page** (`TrainTripsPage.tsx`): Railway schedules, destinations, and remaining capacity gauges.
    - **Allocations Page** (`AllocationsPage.tsx`): Cargo space distribution and order item train assignments.
    - **Truck Fleet & Scheduling Pages** (`TrucksPage.tsx`, `TruckTripsPage.tsx`): Fleet asset tracking and dispatch scheduling.
    - **Deliveries Page** (`DeliveriesPage.tsx`): Real-time last-mile delivery monitoring.

* **Database Engineering & SQL Implementation:**
  - **DDL Tables (`01_tables.sql`):** Engineered the master data entities: `products`, `stores`, `routes`, and `inventory`.
  - **Foreign Key Relationships (`02_relationships.sql`):** Configured foreign keys between stores and supervising workers (`managed_by`), routes and parent stores (`store_id`), and store inventory links.
  - **Check Constraints (`03_constraints.sql`):** Enforced positive unit pricing (`chk_products_unit_price`), positive volumetric space consumption (`chk_products_space_consumption`), non-negative stock counts (`chk_inventory_quantity`), and composite uniqueness (`UNIQUE(store_id, product_id)`).
  - **Indexing (`04_indexes.sql`):** Constructed composite and foreign key indexes (`idx_inventory_store_id`, `idx_inventory_product_id`, `idx_customers_city`) for accelerated geographical querying.
  - **Stored Functions & Seed Data:** Developed inventory lookup helper procedures and generated complete seed datasets covering all FMCG products, 6 destination stores, and delivery routes.

---

#### 👤 3. E. Thanancheyan — 240645V (Thanancheyan)
**Role:** Order Engine & Transaction Specialist  
**Core Responsibilities:** Customer Order Creation Engine, Advance Date Verification, Order Lifecycle Management & In-App Alerts

* **Backend Order Processing Engine:**
  - Architected the multi-item customer order placement workflow (`orderService.ts`), coordinating atomic creation of orders and order line items.
  - Implemented the strict **7-Day Advance Order Rule** at the application layer, ensuring requested delivery dates are at least seven calendar days after placement.
  - Engineered geographic route validation to ensure customer delivery addresses map to verified coverage routes prior to order commitment.
  - Implemented data-level authorization in `orderController.ts` ensuring customers only view their own orders while store managers access store-specific orders.
  - Developed the real-time notification service (`notificationService.ts`, `notificationController.ts`, `notificationRoutes.ts`), managing unread alert counts, read-receipt toggles, and automated notifications.

* **Database Engineering & SQL Implementation:**
  - **DDL Tables (`01_tables.sql`):** Structured the core transaction tables: `orders` (header), `order_items` (line item details), and `order_status_history` (audit logging).
  - **Foreign Key Relationships (`02_relationships.sql`):** Established referential integrity linking orders to customers and routes, and configured `ON DELETE CASCADE` for order line items.
  - **Check Constraints (`03_constraints.sql`):** Enforced status transitions (`chk_orders_status`), positive purchase quantities (`chk_order_items_quantity`), and the database-level **7-day advance interval rule** (`requested_delivery_date >= order_date::date + INTERVAL '7 days'`).
  - **Indexing (`04_indexes.sql`):** Created performance-critical indexes on customer IDs, route IDs, and chronological date indexes (`idx_orders_order_date`) to optimize quarterly reporting aggregations.
  - **Stored Procedures (`database/functions/place_order.sql`):** Authored the atomic PL/pgSQL stored procedure `place_order()`. It encapsulates route validation, order insertion, and line item unpacking from JSONB arrays with robust exception handling (`RAISE EXCEPTION`).
  - **Seed Dataset (`database/seed/seed_data.sql`):** Generated over 40 multi-quarter order records and corresponding order items to support stress testing of reporting queries.

---

#### 👤 4. Athishaya J. — 240051V (Athishaya)
**Role:** Rail Freight & Road Dispatch Operations Lead  
**Core Responsibilities:** Railway Schedule Planning, Cargo Space Allocation & Overflow Splitting, Truck Fleet Dispatch & Crew Rostering

* **Backend Logistics Domain Services:**
  - Engineered the railway freight management system (`trainTripService.ts`, `trainTripController.ts`, `trainTripRoutes.ts`), handling schedules between Kandy Central and destination railway depots.
  - Built the volumetric cargo space allocation engine (`trainAllocationService.ts`, `trainAllocationController.ts`, `trainAllocationRoutes.ts`), calculating space consumption against train limits and managing overflow assignments to subsequent trips.
  - Developed truck fleet inventory tracking (`truckService.ts`, `truckController.ts`, `truckRoutes.ts`), managing vehicle registration and load capacities.
  - Engineered the last-mile truck scheduling engine (`truckTripService.ts`, `truckTripController.ts`, `truckTripRoutes.ts`), enforcing shift assignment rules, preventing vehicle double-booking, and verifying driver and assistant availability.

* **Database Engineering & SQL Implementation:**
  - **DDL Tables (`01_tables.sql`):** Defined logistics operational entities: `train_trips`, `order_train_allocations` (M:N junction), `trucks`, and `truck_trips`.
  - **Foreign Key Relationships (`02_relationships.sql`):** Mapped train trips to destination stores, and truck trips to physical trucks, routes, and driver/assistant worker IDs.
  - **Check Constraints (`03_constraints.sql`):** Enforced positive train and truck capacities, positive allocations, and chronological validity (`arrival_time > departure_time`, `end_time > start_time`).
  - **Indexing (`04_indexes.sql`):** Built composite B-Tree indexes for continuous schedule verification (`idx_truck_trips_driver_start`, `idx_truck_trips_assistant_start`, `idx_train_trips_lookup`).
  - **Stored Functions (`database/functions/`):**
    - `assign_order_to_train.sql`: Calculates item space consumption and allocates cargo, splitting overflow across trips.
    - `assign_truck_trip.sql`: Manages last-mile trip dispatching.
    - `calculate_weekly_hours.sql`: Calculates cumulative ISO weekly working hours for workers.
  - **Automated Validation Triggers (`database/triggers/`):**
    - `train_capacity_check.sql`: `BEFORE INSERT/UPDATE` trigger blocking allocations that exceed train capacity.
    - `truck_trip_overlap_check.sql`: `BEFORE INSERT/UPDATE` trigger preventing time-window conflicts for trucks, drivers, and assistants.
    - `working_hours_check.sql`: `BEFORE INSERT/UPDATE` trigger enforcing the **40-hour driver** and **60-hour assistant** weekly limits.
    - `consecutive_assignment_check.sql`: `BEFORE INSERT/UPDATE` trigger enforcing shift rest rules (drivers cannot take 2 consecutive deliveries; assistants max 2).
  - **Seed Dataset (`database/seed/seed_data.sql`):** Populated railway timetables, truck assets, and historical dispatch trips.

---

#### 👤 5. Wijerathne W. D. D — 220715T (Dakshitha)
**Role:** Last-Mile Fulfillment & BI Analytics Lead  
**Core Responsibilities:** Last-Mile Fulfillment State Machine, Automated Rollup Triggers, Business Intelligence Reports Engine & UI

* **Backend Deliveries & Reporting Aggregation:**
  - Engineered the last-mile delivery tracking service (`deliveryService.ts`, `deliveryController.ts`, `deliveryRoutes.ts`), managing state transitions (`Pending` $\rightarrow$ `Scheduled` $\rightarrow$ `Delivered` / `Failed` $\rightarrow$ `Returned`).
  - Developed the Business Intelligence Aggregation Engine (`reportService.ts`, `reportController.ts`, `reportRoutes.ts`), implementing complex raw SQL queries for all **7 required SRS management reports**:
    1. **Quarterly Sales Report**: Revenue and cargo volume aggregations grouped by year and quarter.
    2. **Most-Ordered Items Report**: FMCG product sales volume and revenue rankings per quarter.
    3. **City-Wise Sales Report**: Revenue distribution across all 6 destination cities.
    4. **Route-Wise Sales Report**: Sales distribution across delivery routes.
    5. **Worker Working Hours Report**: Driver and assistant logged hours against weekly limits.
    6. **Truck Usage Report**: Monthly vehicle trip frequencies and operating hours.
    7. **Customer Order History Report**: Order lifecycle tracking and delivery timestamps.

* **Frontend Business Intelligence Reporting Suite:**
  - Created the dedicated reporting suite in `frontend/src/pages/admin/reports/`:
    - `QuarterlySalesReport.tsx`: Dual-axis Recharts visualization with KPIs and quarterly filtering.
    - `TopProductsReport.tsx`: Product volume rankings with horizontal bar charts.
    - `CityRouteSalesReport.tsx`: City and route geographic breakdown with pie and bar charts.
    - `WorkerHoursReport.tsx`: Crew hour tracking with threshold alerts.
    - `TruckUsageReport.tsx`: Monthly vehicle utilization charts.
    - `CustomerOrderHistoryReport.tsx`: Order history search and timeline view.
    - `reportUtils.ts`: Common CSV export engine and chart theme configurations.

* **Database Engineering & SQL Implementation:**
  - **DDL Tables (`01_tables.sql`):** Structured the `delivery_items` last-mile fulfillment table.
  - **Foreign Key Relationships (`02_relationships.sql`):** Connected delivery items to parent order items (`ON DELETE CASCADE`) and truck trips.
  - **Check Constraints (`03_constraints.sql`):** Enforced delivery item status values (`chk_delivery_items_status`) and positive quantities.
  - **Indexing (`04_indexes.sql`):** Created delivery tracking indexes (`idx_delivery_items_order_item`, `idx_delivery_items_truck_trip`).
  - **Stored Functions (`database/functions/update_delivery_status.sql`):** Implemented the status transition function.
  - **Automated Rollup Triggers (`database/triggers/delivery_completion_rollup.sql`):** Engineered the `AFTER UPDATE` trigger `rollup_delivery_status()` that automatically updates the parent `orders.status` to `'Delivered'` once all associated delivery items reach completion.
  - **Seed Dataset & BI Validation (`database/seed/seed_data.sql`):** Created realistic delivery status seed data and verified output across all 7 analytical report queries.

---

### Workload & Balance Matrix

| Dimension | Ranasinghe R. G. A. D. B | Jayarathna M. G. P. S | E. Thanancheyan | Athishaya J. | Wijerathne W. D. D |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Backend Modules** | Core, Auth, Users (14 files) | Products, Stores, Routes (9 files) | Orders, Notifications (6 files) | Trains, Fleet, Trips (12 files) | Deliveries, 7 Reports (6 files) |
| **Frontend Interfaces** | Core Shell, Auth, Landing, Dashboard (14 files) | 12 Admin & Logistics Views (12 files) | Review & Notification integration | Operational review integration | 7 BI Interactive Reports (7 files) |
| **Database DDL Tables** | 4 tables (`users`, `customers`, `workers`, `notifications`) | 4 tables (`products`, `stores`, `routes`, `inventory`) | 3 tables (`orders`, `order_items`, `order_status_history`) | 4 tables (`train_trips`, `allocations`, `trucks`, `truck_trips`) | 1 table (`delivery_items`) + Reporting Views |
| **Triggers & Stored Procs** | Audit Log Trigger | Store Lookup Functions | `place_order` Stored Procedure | 4 Roster Triggers + 3 Allocation Functions | Completion Rollup Trigger + Status Machine |
| **Total Contribution Weight** | **20%** | **20%** | **20%** | **20%** | **20%** |

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | 19.x | Component-based user interface |
| **Build Tool & Bundler** | Vite | 6.x | Rapid compilation and Hot Module Replacement (HMR) |
| **Language** | TypeScript | 5.x | Strict end-to-end type safety |
| **Styling** | Vanilla CSS + Tokens | CSS3 | Custom enterprise design system (Light & Dark themes) |
| **Visual Analytics** | Recharts | 2.x | Composable chart components for reports and dashboards |
| **Icons** | Lucide React | Latest | Consistent icon set |
| **Routing** | React Router | 7.x | Declarative client-side routing with role guards |
| **Backend Runtime** | Node.js | 22.x | High-performance asynchronous execution runtime |
| **API Framework** | Express.js | 5.x | REST API server with custom middleware architecture |
| **Database Driver** | `pg` (node-postgres) | 8.x | **Direct connection pool; raw parameterized SQL queries (No ORM)** |
| **Authentication** | `jsonwebtoken` + `bcryptjs` | 9.x / 2.x | Stateless JWT authentication via HttpOnly cookies and bcrypt hashing |
| **Schema Validation** | Zod | 3.x | Runtime request body and query parameter validation |
| **Relational Database** | PostgreSQL | 17.x | Enterprise ACID-compliant relational database |
| **Containerization** | Docker & Docker Compose | 28.x / 2.x | Multi-container development and production orchestration |

---

## Architecture Overview

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                             CLIENT LAYER                               │
 │             React 19 + TypeScript SPA (Vite Dev Server)                │
 │       Runs on Port 5173 — Role-Based Dashboards & Analytics Suite      │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                        HTTP Requests (JSON / Axios)
                       withCredentials: true (HttpOnly Cookie)
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                          EXPRESS.JS BACKEND                            │
 │                        Runs on Port 3000                               │
 │                                                                        │
 │  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
 │  │ Global Middleware     │──▶│ Zod Validation Pipeline              │  │
 │  │ CORS, CookieParser    │   │ Validates body, query, and params    │  │
 │  └──────────┬────────────┘   └──────────────────┬───────────────────┘  │
 │             │                                   │                      │
 │             ▼                                   ▼                      │
 │  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
 │  │ Auth & Role Guards    │──▶│ Controllers & Business Services      │  │
 │  │ JWT Verify, RBAC Check│   │ Domain business logic execution      │  │
 │  └───────────────────────┘   └──────────────────┬───────────────────┘  │
 └─────────────────────────────────────────────────┼──────────────────────┘
                                                   │
                                     pg Pool (node-postgres)
                                     Parameterized Raw SQL
                                                   │
                                                   ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                        POSTGRESQL 17 DATABASE                          │
 │                        Runs on Port 5432 (5433 host)                   │
 │                                                                        │
 │  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
 │  │ Tables & Foreign Keys │   │ Stored Procedures & Functions        │  │
 │  │ 16 normalized tables  │   │ place_order(), assign_order_to_train │  │
 │  └───────────────────────┘   └──────────────────────────────────────┘  │
 │  ┌───────────────────────┐   ┌──────────────────────────────────────┐  │
 │  │ Check Constraints     │   │ Automated Triggers                   │  │
 │  │ Domain integrity rules│   │ Overlap, hours, rollups, audit logs  │  │
 │  └───────────────────────┘   └──────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## Domain Model & Entity Relationships

The schema is normalized to **3NF / BCNF**, utilizing an **ISA inheritance** hierarchy for user management and explicit junction entities for multi-modal cargo allocation.

```
                           ┌───────────────────────────┐
                           │        users (ISA)        │
                           │ id, username, system_role │
                           └─────────────┬─────────────┘
                                         │ 1:1
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │         customers         │                   │          workers          │
   │ id, street, city, phone   │                   │ id, type, hourly_pay      │
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │ 1:N                                           │ 1:N
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │          orders           │                   │          stores           │
   │ id, customer_id, route_id │                   │ id, name, city, managed_by│
   └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                 │ 1:N                                           │ 1:N
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │        order_items        │                   │          routes           │
   │ id, order_id, product_id  │                   │ id, store_id, area_name   │
   └───────┬───────────┬───────┘                   └───────────────────────────┘
           │           │
           │           │ 1:N
           │           ▼
           │     ┌───────────────────────────────────────────┐
           │     │          order_train_allocations          │
           │     │   order_item_id, train_trip_id, quantity  │
           │     └─────────────────────▲─────────────────────┘
           │                           │ M:1
           │             ┌─────────────┴─────────────┐
           │             │        train_trips        │
           │             │ from_city, to_city, date  │
           │             └───────────────────────────┘
           │
           │ 1:N
           ▼
   ┌───────────────────────────────────────────┐   ┌───────────────────────────┐
   │              delivery_items               │   │          trucks           │
   │  order_item_id, truck_trip_id, status     │   │ id, vehicle_no, capacity  │
   └───────────────────▲───────────────────────┘   └─────────────┬─────────────┘
                       │                                         │
                       │ M:1                                     │ 1:N
                       └───────────────────┬─────────────────────┘
                                           ▼
                                 ┌───────────────────┐
                                 │    truck_trips    │
                                 │ driver, assistant │
                                 └───────────────────┘
```

---

## Business Rules & Logistics Constraints

1. **7-Day Advance Order Rule**: Orders must be booked at least 7 days ahead of requested delivery:
   $$\text{requested\_delivery\_date} \ge \text{order\_date} + 7\text{ days}$$
   Enforced at the database level by `chk_orders_7day_rule` and procedurally validated in `place_order()`.
2. **Volumetric Train Space Consumption**: Every product has a consumption rate (units of cargo space per item). Allocations verify that total consumed space does not exceed train wagon volume limits.
3. **Automatic Train Cargo Spillover**: When an order item exceeds remaining train capacity, the available portion is allocated, and the remaining balance rolls over to the next available train trip.
4. **Driver Rostering Rules**:
   - Drivers must not be assigned to two consecutive deliveries.
   - Drivers are capped at **40 working hours per week** (ISO week).
   - Enforced by `working_hours_check` and `consecutive_assignment_check` triggers.
5. **Assistant Rostering Rules**:
   - Assistants can work a maximum of two consecutive routes before mandatory rest.
   - Assistants are capped at **60 working hours per week**.
   - Enforced by triggers before trip assignments.
6. **No Double-Booking**: Trucks, drivers, and assistants cannot be scheduled for overlapping route timeframes. Enforced by `truck_trip_overlap_check`.
7. **Automated Order Completion Rollup**: When all line items for an order reach `'Delivered'` status in `delivery_items`, the `delivery_completion_rollup` trigger automatically updates the parent `orders.status` to `'Delivered'`.

---

## Database Design & Schema Enhancements

Based on requirements analysis, several enhancements were introduced over initial designs:

1. **Separation of System Role vs. Worker Type**:
   - Added `users.system_role` (`admin`, `dispatcher`, `store_manager`, `driver`, `assistant`, `customer`) for application authorization.
   - Preserved `workers.type` for employment classification.
2. **Audit Logging (`order_status_history`)**:
   - Dedicated audit table capturing every status change, timestamp, and modifying user ID via automated triggers.
3. **UUID Primary Keys**:
   - Primary keys use `UUID` generated via `gen_random_uuid()` to prevent enumeration attacks and support distributed scalability.
4. **Explicit Train-to-Store Foreign Key**:
   - Added `train_trips.destination_store_id` (FK to `stores`) to explicitly bind railway schedules to destination warehouses.
5. **In-App Notification Entity**:
   - Added `notifications` table to store real-time user alerts for status updates and trip assignments.

---

## Management Reports & BI Suite

The system implements the 7 required management reports via parameterized raw SQL queries:

1. **Quarterly Sales Report**: Aggregates revenue and sales volume grouped by year and quarter.
2. **Most Ordered Items Report**: Top-performing FMCG products ranked by order volume and revenue per quarter.
3. **City-Wise Sales Report**: Sales distribution across destination cities.
4. **Route-Wise Sales Report**: Last-mile revenue breakdown across specific delivery routes.
5. **Driver and Assistant Working Hours Report**: Logged hours per crew member with compliance tracking against 40h/60h limits.
6. **Truck Usage Analysis Report**: Monthly vehicle utilization, trip counts, and operating hours.
7. **Customer Order History Report**: Comprehensive customer order logs with delivery status timestamps.

---

## REST API Design

All endpoints require authentication (via HttpOnly JWT cookie) except login and registration.

### Authentication & User Endpoints
- `POST /api/auth/register` — Customer registration
- `POST /api/auth/login` — Authenticate and issue HttpOnly JWT cookie
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Return current authenticated user profile
- `GET /api/users` — List users (*Admin*)
- `POST /api/users` — Create staff user (*Admin*)
- `PUT /api/users/:id` — Update user details (*Admin*)
- `DELETE /api/users/:id` — Deactivate user account (*Admin*)

### Master Data Endpoints
- `GET /api/products` — Product catalogue
- `POST /api/products` — Create product (*Admin*)
- `PUT /api/products/:id` — Update product details (*Admin*)
- `GET /api/stores` — List regional stores (*Admin, Dispatcher, Store Manager*)
- `POST /api/stores` — Create store depot (*Admin*)
- `GET /api/routes` — List delivery routes (*Admin, Dispatcher, Store Manager*)
- `POST /api/routes` — Create route (*Admin*)

### Order Processing Endpoints
- `GET /api/orders` — List orders (filtered by user role)
- `GET /api/orders/:id` — Get order details with items
- `POST /api/orders` — Place order (*Customer*)
- `PATCH /api/orders/:id/status` — Update order status (*Dispatcher, Store Manager*)

### Logistics & Fleet Endpoints
- `GET /api/train-trips` — List train schedules (*Admin, Dispatcher*)
- `POST /api/train-trips` — Create train schedule (*Admin*)
- `GET /api/train-allocations` — View cargo allocations (*Dispatcher*)
- `POST /api/train-allocations` — Allocate order item to train (*Dispatcher*)
- `GET /api/trucks` — View truck assets (*Admin, Dispatcher*)
- `POST /api/trucks` — Register truck (*Admin*)
- `GET /api/truck-trips` — List truck trips (filtered by role)
- `POST /api/truck-trips` — Dispatch truck trip (*Dispatcher, Store Manager*)
- `PATCH /api/deliveries/:id/status` — Update delivery status (*Driver, Assistant*)

### Reporting & Analytics Endpoints
- `GET /api/reports/quarterly-sales` — Quarterly sales report (*Admin*)
- `GET /api/reports/top-products` — Top products report (*Admin*)
- `GET /api/reports/city-sales` — City-wise sales breakdown (*Admin*)
- `GET /api/reports/route-sales` — Route-wise sales breakdown (*Admin*)
- `GET /api/reports/worker-hours` — Worker hours report (*Admin*)
- `GET /api/reports/truck-usage` — Monthly truck usage report (*Admin*)
- `GET /api/reports/customer-orders` — Customer order history (*Admin, Customer*)

---

## Prerequisites & Environment Setup

### Required Tools
- **Docker & Docker Compose**: Docker Engine 24+ and Docker Compose v2
- **Node.js**: v20+ or v22+ LTS (if running locally outside Docker)
- **Git**: For version control

### Environment Variables Configuration
Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

| Variable | Description | Docker Default | Local Host Default |
|---|---|---|---|
| `POSTGRES_HOST` | Database host | `postgres` | `localhost` |
| `POSTGRES_PORT` | Port inside network | `5432` | `5433` (exposed on host) |
| `POSTGRES_DB` | Database name | `scds` | `scds` |
| `POSTGRES_USER` | DB user | `scds_user` | `scds_user` |
| `POSTGRES_PASSWORD` | DB password | `change_me_to_a_strong_password` | `change_me_to_a_strong_password` |
| `BACKEND_PORT` | Express server port | `3000` | `3000` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` | `http://localhost:5173` |
| `JWT_SECRET` | Secret key for JWT signing | Strong random string | Strong random string |
| `JWT_EXPIRES_IN` | Token duration | `24h` | `24h` |
| `NODE_ENV` | Runtime environment | `development` | `development` |

---

## How to Run the Project

### Option A: Running with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anuhasranasinghe/group-19-supply-chain-distribution-system.git
   cd group-19-supply-chain-distribution-system
   ```

2. **Start all services:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:3000](http://localhost:3000)
   - **PostgreSQL Database**: Accessible on host port `5433` (or `5432` per `.env`)

4. **Default Seed Credentials:**
   - **Admin**: `username: admin` | `password: password123`
   - **Dispatcher**: `username: dispatcher` | `password: password123`
   - **Store Manager**: `username: mgr_colombo` | `password: password123`
   - **Driver**: `username: driver_1` | `password: password123`
   - **Assistant**: `username: ast_1` | `password: password123`
   - **Customer**: `username: cust_col1` | `password: password123`

---

### Option B: Local Development (Without Docker)

1. **Database Setup:**
   Ensure PostgreSQL is running locally with database `scds`, and run the SQL migration scripts in order:
   ```bash
   psql -U scds_user -d scds -f database/schema/01_tables.sql
   psql -U scds_user -d scds -f database/schema/02_relationships.sql
   psql -U scds_user -d scds -f database/schema/03_constraints.sql
   psql -U scds_user -d scds -f database/schema/04_indexes.sql
   # Run functions & triggers
   psql -U scds_user -d scds -f database/seed/seed_data.sql
   ```

2. **Backend Server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Application:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Docker & Development Workflow

### Useful Docker Commands
```bash
# View running container status
docker compose ps

# View real-time logs for a specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Stop all containers
docker compose down

# Stop and wipe database volume (clean reset)
docker compose down -v

# Connect directly to PostgreSQL inside container
docker exec -it scds-postgres psql -U scds_user -d scds
```

### TypeScript Verification
To verify code compilation without building bundles:
```bash
# Frontend type check
cd frontend && npx tsc --noEmit

# Backend type check
cd backend && npx tsc --noEmit
```

---

## License & Acknowledgments

This project is developed as an academic project for **CS2043: Database Systems**, Department of Computer Science and Engineering, **University of Moratuwa**.

* **Course**: CS2043 Database Systems (Semester 3)
* **Team**: Group 19
* **Institution**: University of Moratuwa, Sri Lanka
