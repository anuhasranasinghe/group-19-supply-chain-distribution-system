-- Order status must be a recognized value
ALTER TABLE orders
ADD CONSTRAINT chk_orders_status
CHECK (status IN ('Pending', 'Scheduled', 'Delivered'));

-- 7-Day Advance Order Rule
ALTER TABLE orders
ADD CONSTRAINT chk_orders_7day_rule
CHECK (requested_delivery_date >= order_date::date + INTERVAL '7 days');

-- Order item quantity must be positive
ALTER TABLE order_items
ADD CONSTRAINT chk_order_items_quantity
CHECK (quantity > 0);

-- Product unit price must be positive
ALTER TABLE products
  ADD CONSTRAINT chk_products_unit_price
  CHECK (unit_price > 0);

-- Product space consumption must be positive
ALTER TABLE products
  ADD CONSTRAINT chk_products_unit_space_consumption
  CHECK (unit_space_consumption > 0);

-- Delivery item status must be a recognized value
ALTER TABLE delivery_items
ADD CONSTRAINT chk_delivery_items_status
CHECK (
    delivery_status IN (
        'Pending', 'Scheduled', 'Delivered', 'Failed', 'Returned'
    )
);

-- Delivery quantity must be positive
ALTER TABLE delivery_items
ADD CONSTRAINT chk_delivery_items_quantity
CHECK (quantity > 0);

-- Inventory quantity cannot be negative
ALTER TABLE inventory
  ADD CONSTRAINT chk_inventory_quantity
  CHECK (quantity >= 0);

-- Each product must appear only once in each store
ALTER TABLE inventory
  ADD CONSTRAINT uq_inventory_store_product
  UNIQUE (store_id, product_id);